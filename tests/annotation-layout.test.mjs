import test from 'node:test';
import assert from 'node:assert/strict';
import {
  containedFrame,
  introVisibility,
  labelPosition,
} from '../src/story/annotation-layout.mjs';

test('contain geometry retains the whole source on phone and ultrawide without crop', () => {
  for (const [width, height] of [
    [390, 844],
    [3440, 1440],
    [1440, 1000],
  ]) {
    const frame = containedFrame(width, height);
    assert.ok(frame.x >= 0 && frame.y >= 0);
    assert.ok(
      frame.x + frame.width <= width + 0.01 && frame.y + frame.height <= height + 0.01,
    );
    assert.equal(frame.width / frame.height, 16 / 9);
  }
});
test('intro is reversible, bounded and never displays competing logo and text', () => {
  assert.deepEqual(introVisibility(0), { logo: 1, caption: 0 });
  assert.deepEqual(introVisibility(1.7), { logo: 0, caption: 1 });
  const times = [-1, 0, 0.3, 0.5, 1, 1.1, 1.4, 1.7, 3, 10];
  for (const time of times) {
    const state = introVisibility(time);
    assert.ok(
      state.logo >= 0 && state.logo <= 1 && state.caption >= 0 && state.caption <= 1,
    );
    assert.equal(state.logo * state.caption, 0);
  }
  assert.deepEqual(
    times.map(introVisibility),
    times.toReversed().map(introVisibility).toReversed(),
  );
});
test('caption placement keeps longer copy within compact and ultrawide viewports', () => {
  for (const [width, height, labelWidth, labelHeight] of [
    [320, 568, 272, 190],
    [3440, 1440, 460, 290],
    [844, 390, 253, 230],
  ]) {
    for (let phase = 0; phase < 4; phase++) {
      const label = labelPosition(phase, width, height, labelWidth, labelHeight);
      assert.ok(label.x >= 24 && label.x + labelWidth <= width - 24);
      assert.ok(label.y >= 76 && label.y + labelHeight <= height - 42);
    }
  }
});
