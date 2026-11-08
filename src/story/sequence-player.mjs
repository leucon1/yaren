import { frameForProgress } from './timeline.mjs';

// A single rendered camera path, with bounded decoded memory. No crossfades or
// interpolated object transforms: each displayed image is a real scene render.
export class SequencePlayer {
  constructor(canvas, sequence, { onFrame, onError }) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: false });
    if (!this.context) throw new Error('Canvas is unavailable');
    this.sequence = sequence;
    this.onFrame = onFrame;
    this.onError = onError;
    this.cache = new Map();
    this.pending = new Map();
    this.target = -1;
    this.disposed = false;
    canvas.dataset.ready = 'false';
    delete canvas.dataset.frame;
    canvas.width = sequence.width;
    canvas.height = sequence.height;
    canvas.dataset.frameCount = String(sequence.count);
  }

  async load(index, priority = 'low') {
    if (this.disposed) return null;
    if (this.cache.has(index)) return this.cache.get(index);
    if (this.pending.has(index)) return this.pending.get(index).promise;
    const url = this.sequence.pattern.replace('{index}', String(index).padStart(3, '0'));
    const entry = { controller: new AbortController(), promise: null };
    entry.promise = (async () => {
      const response = await fetch(url, { signal: entry.controller.signal, priority });
      if (!response.ok) throw new Error('Frame unavailable');
      const bitmap = await createImageBitmap(await response.blob());
      if (this.disposed || entry.controller.signal.aborted) {
        bitmap.close();
        return null;
      }
      this.cache.set(index, bitmap);
      this.trim();
      return bitmap;
    })();
    this.pending.set(index, entry);
    try {
      return await entry.promise;
    } finally {
      // An aborted request may finish after a new request for the same index.
      if (this.pending.get(index) === entry) this.pending.delete(index);
    }
  }

  trim() {
    // Nine decoded frames cost ~21 MB at 960×600, ~19 MB on mobile.
    while (this.cache.size > 9) {
      const farthest = [...this.cache.keys()]
        .filter((index) => index !== this.target)
        .sort((a, b) => Math.abs(b - this.target) - Math.abs(a - this.target))[0];
      if (farthest === undefined) return;
      this.cache.get(farthest).close();
      this.cache.delete(farthest);
    }
    this.canvas.dataset.cachedFrames = String(this.cache.size);
  }

  seek(progress) {
    if (this.disposed) return;
    const index = frameForProgress(progress, this.sequence.count);
    this.canvas.dataset.progress = progress.toFixed(5);
    if (index === this.target) return;
    const direction = index >= this.target ? 1 : -1;
    this.target = index;
    for (const [pendingIndex, entry] of this.pending) {
      if (Math.abs(pendingIndex - index) > 2) {
        entry.controller.abort();
        this.pending.delete(pendingIndex);
      }
    }
    this.load(index, 'high')
      .then((bitmap) => {
        // A completed old request must never paint over a newer scroll target.
        if (!bitmap || this.disposed || this.target !== index) return;
        this.context.drawImage(bitmap, 0, 0);
        this.canvas.dataset.frame = String(index);
        this.canvas.dataset.ready = 'true';
        this.onFrame(index);
        for (const offset of [direction, 2 * direction, -direction, -2 * direction]) {
          const nearby = index + offset;
          if (nearby >= 0 && nearby < this.sequence.count && this.pending.size < 5) {
            this.load(nearby).catch(() => {});
          }
        }
      })
      .catch((error) => {
        if (!this.disposed && this.target === index && error.name !== 'AbortError')
          this.onError(error);
      });
  }

  dispose() {
    this.disposed = true;
    for (const entry of this.pending.values()) entry.controller.abort();
    for (const bitmap of this.cache.values()) bitmap.close();
    this.cache.clear();
    this.pending.clear();
  }
}
