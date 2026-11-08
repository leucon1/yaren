import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { SequencePlayer } from '../src/story/sequence-player.mjs';

function canvas() {
  const painted = [];
  return {
    dataset: {},
    painted,
    getContext: () => ({
      drawImage(bitmap) {
        assert.equal(bitmap.closed, false);
        painted.push(bitmap.index);
      },
    }),
  };
}

function installBitmaps(t) {
  const previous = globalThis.createImageBitmap;
  const bitmaps = [];
  globalThis.createImageBitmap = async (data) => {
    const bitmap = {
      index: data.index,
      closed: false,
      close() {
        this.closed = true;
      },
    };
    bitmaps.push(bitmap);
    return bitmap;
  };
  t.after(() => {
    if (previous) globalThis.createImageBitmap = previous;
    else delete globalThis.createImageBitmap;
  });
  return bitmaps;
}

test('an outdated async frame cannot paint over a newer scroll target', async (t) => {
  installBitmaps(t);
  const responses = new Map();
  t.mock.method(
    globalThis,
    'fetch',
    (url) =>
      new Promise((resolve) => responses.set(Number(url.match(/\d+/)[0]), resolve)),
  );
  const view = canvas();
  const player = new SequencePlayer(
    view,
    { width: 960, height: 600, count: 10, pattern: 'frame-{index}.webp' },
    {
      onFrame() {},
      onError(error) {
        throw error;
      },
    },
  );
  player.seek(0);
  player.seek(1 / 9);
  responses.get(1)({ ok: true, blob: async () => ({ index: 1 }) });
  await setImmediate();
  responses.get(0)({ ok: true, blob: async () => ({ index: 0 }) });
  await setImmediate();
  assert.deepEqual(view.painted, [1]);
  player.dispose();
});

test('decoded cache stays bounded and all bitmaps are released on close', async (t) => {
  const bitmaps = installBitmaps(t);
  t.mock.method(globalThis, 'fetch', async (url) => ({
    ok: true,
    blob: async () => ({ index: Number(url.match(/\d+/)[0]) }),
  }));
  const view = canvas();
  const player = new SequencePlayer(
    view,
    { width: 960, height: 600, count: 30, pattern: 'frame-{index}.webp' },
    {
      onFrame() {},
      onError(error) {
        throw error;
      },
    },
  );
  for (let index = 0; index < 30; index++) {
    player.seek(index / 29);
    await setImmediate();
    assert.ok(player.cache.size <= 9);
  }
  assert.equal(view.dataset.frame, '29');
  assert.ok(bitmaps.some((bitmap) => bitmap.closed));
  player.dispose();
  assert.ok(bitmaps.every((bitmap) => bitmap.closed));
});

test('a failed obsolete request cannot invalidate a successfully drawn newer frame', async (t) => {
  installBitmaps(t);
  const responses = new Map();
  const failures = new Map();
  t.mock.method(
    globalThis,
    'fetch',
    (url) =>
      new Promise((resolve, reject) => {
        const index = Number(url.match(/\d+/)[0]);
        responses.set(index, resolve);
        failures.set(index, reject);
      }),
  );
  const errors = [];
  const view = canvas();
  const player = new SequencePlayer(
    view,
    { width: 960, height: 600, count: 10, pattern: 'frame-{index}.webp' },
    {
      onFrame() {},
      onError(error) {
        errors.push(error);
      },
    },
  );
  player.seek(0);
  player.seek(1 / 9);
  responses.get(1)({ ok: true, blob: async () => ({ index: 1 }) });
  await setImmediate();
  failures.get(0)(new Error('Old connection failed'));
  await setImmediate();
  assert.deepEqual(view.painted, [1]);
  assert.equal(errors.length, 0);
  player.dispose();
});

test('rapid seeking cancels distant requests and bounds in-flight work', async (t) => {
  installBitmaps(t);
  const signals = [];
  t.mock.method(
    globalThis,
    'fetch',
    (_url, options) =>
      new Promise((_resolve, reject) => {
        signals.push(options.signal);
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      }),
  );
  const player = new SequencePlayer(
    canvas(),
    { width: 960, height: 600, count: 180, pattern: 'frame-{index}.webp' },
    {
      onFrame() {},
      onError(error) {
        throw error;
      },
    },
  );
  for (let index = 0; index < 60; index++) player.seek(index / 179);
  assert.ok(player.pending.size <= 5);
  assert.ok(signals.filter((signal) => signal.aborted).length >= 55);
  player.dispose();
  await setImmediate();
});
