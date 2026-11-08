import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scrollProgress,
  frameForProgress,
  milestoneForProgress,
} from '../src/story/timeline.mjs';

test('natural section travel maps to a bounded timeline without changing scroll', () => {
  assert.equal(scrollProgress(500, 1000, 3400, 1000), 0);
  assert.equal(scrollProgress(1000, 1000, 3400, 1000), 0);
  assert.equal(scrollProgress(2200, 1000, 3400, 1000), 0.5);
  assert.equal(scrollProgress(3400, 1000, 3400, 1000), 1);
  assert.equal(scrollProgress(5000, 1000, 3400, 1000), 1);
  assert.equal(scrollProgress(1000, 1000, 500, 1000), 0);
});
test('forward and reverse scrubbing use the exact same frames', () => {
  const progress = Array.from({ length: 181 }, (_, i) => i / 180);
  const forward = progress.map((p) => frameForProgress(p, 181));
  const backward = [...progress].reverse().map((p) => frameForProgress(p, 181));
  assert.deepEqual(forward, [...backward].reverse());
  assert.equal(frameForProgress(-1, 181), 0);
  assert.equal(frameForProgress(2, 181), 180);
});
test('four narrative milestones share one continuous progress value', () => {
  assert.deepEqual([0, 0.3, 0.5, 0.75, 1].map(milestoneForProgress), [0, 1, 2, 3, 3]);
  assert.equal(milestoneForProgress(-1), 0);
});
