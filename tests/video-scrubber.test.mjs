import test from 'node:test';
import assert from 'node:assert/strict';
import { VideoScrubber } from '../src/story/video-scrubber.mjs';

// Unit boundary for asynchronous metadata/seeking; real MP4 behavior has browser tests.
class MediaElement extends EventTarget {
  duration = NaN;
  seeking = false;
  time = 0;
  assignments = [];
  paused = false;
  get currentTime() {
    return this.time;
  }
  set currentTime(value) {
    assert.equal(this.seeking, false, 'do not start overlapping seeks');
    this.time = value;
    this.assignments.push(value);
    this.seeking = true;
  }
  pause() {
    this.paused = true;
  }
  metadata(duration) {
    this.duration = duration;
    this.dispatchEvent(new Event('loadedmetadata'));
  }
  complete() {
    this.seeking = false;
    this.dispatchEvent(new Event('seeked'));
  }
}

test('metadata-delayed MP4 maps the latest scroll value to video time without autoplay', () => {
  const video = new MediaElement();
  const player = new VideoScrubber(video, { onError: assert.fail });
  player.seek(0.2);
  player.seek(0.8);
  assert.deepEqual(video.assignments, []);
  video.metadata(10);
  assert.deepEqual(video.assignments, [8]);
  assert.equal(video.paused, true);
  player.dispose();
});

test('MP4 coalesces overlapping targets and reverses on the same timeline', () => {
  const video = new MediaElement();
  const player = new VideoScrubber(video, { onError: assert.fail });
  video.metadata(10);
  player.seek(0.8);
  player.seek(0.2);
  player.seek(0.6);
  assert.deepEqual(video.assignments, [8]);
  video.complete();
  assert.deepEqual(video.assignments, [8, 6]);
  video.complete();
  player.seek(0.1);
  assert.deepEqual(video.assignments, [8, 6, 1]);
  player.dispose();
});

test('MP4 clamps progress and disposal prevents late metadata or errors doing work', () => {
  const video = new MediaElement();
  const errors = [];
  const player = new VideoScrubber(video, { onError: (error) => errors.push(error) });
  video.metadata(5);
  player.seek(2);
  assert.deepEqual(video.assignments, [5]);
  video.complete();
  player.seek(-1);
  assert.deepEqual(video.assignments, [5, 0]);
  player.dispose();
  video.complete();
  video.metadata(20);
  video.dispatchEvent(new Event('error'));
  player.seek(0.5);
  assert.deepEqual(video.assignments, [5, 0]);
  assert.deepEqual(errors, []);
});

test('MP4 failure reports once and stops accepting scroll targets', () => {
  const video = new MediaElement();
  let errors = 0;
  const player = new VideoScrubber(video, { onError: () => errors++ });
  video.dispatchEvent(new Event('error'));
  video.dispatchEvent(new Event('error'));
  video.metadata(10);
  player.seek(0.5);
  assert.equal(errors, 1);
  assert.deepEqual(video.assignments, []);
});

// A seek to duration itself can display a blank/end state on native video elements.
test('configured frame rate holds the last frame at full progress', () => {
  const video = new MediaElement();
  const player = new VideoScrubber(video, { onError: assert.fail, frameRate: 24 });
  video.metadata(10);
  player.seek(1);
  assert.equal(video.currentTime, 239 / 24);
  video.complete();
  player.seek(0);
  assert.equal(video.currentTime, 0);
  player.dispose();
});
