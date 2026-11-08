import { clampProgress } from './timeline.mjs';

// Scroll owns the clock. Only one native seek may be in flight;
// the newest target is applied when that seek completes.
export class VideoScrubber {
  constructor(video, { onError, frameRate }) {
    this.video = video;
    this.progress = 0;
    this.disposed = false;
    this.flush = () => {
      const duration = video.duration;
      if (this.disposed || video.seeking || !Number.isFinite(duration) || duration <= 0)
        return;
      // Keep the final decoded frame visible instead of seeking past its timestamp.
      const lastFrame = frameRate > 0 ? Math.max(0, duration - 1 / frameRate) : duration;
      const time = Math.min(this.progress * duration, lastFrame);
      if (Math.abs(video.currentTime - time) > 1 / 120) video.currentTime = time;
    };
    this.fail = () => {
      if (this.disposed) return;
      this.dispose();
      onError(new Error('Video unavailable'));
    };
    video.pause();
    video.addEventListener('loadedmetadata', this.flush);
    video.addEventListener('durationchange', this.flush);
    video.addEventListener('seeked', this.flush);
    video.addEventListener('error', this.fail);
  }

  seek(progress) {
    if (this.disposed) return;
    this.progress = clampProgress(progress);
    this.flush();
  }

  dispose() {
    this.disposed = true;
    this.video.pause();
    this.video.removeEventListener('loadedmetadata', this.flush);
    this.video.removeEventListener('durationchange', this.flush);
    this.video.removeEventListener('seeked', this.flush);
    this.video.removeEventListener('error', this.fail);
  }
}
