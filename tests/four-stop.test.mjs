import test from 'node:test';
import assert from 'node:assert/strict';
import { FourStopController, nearestStop } from '../src/story/four-stop.mjs';

function fixture(progress = 0.43) {
  let time = 0,
    next = 0;
  const jobs = new Map(),
    writes = [];
  const state = { progress, top: 1000, travel: 3000, pinned: true };
  const schedule = (fn, delay) => {
    const id = ++next;
    jobs.set(id, { fn, at: time + delay });
    return id;
  };
  const clock = {
    performance: { now: () => time },
    setTimeout: (fn, delay) => schedule(fn, delay),
    clearTimeout: (id) => jobs.delete(id),
    requestAnimationFrame: (fn) => schedule(() => fn(time), 16),
    cancelAnimationFrame: (id) => jobs.delete(id),
  };
  const advance = (duration) => {
    const end = time + duration;
    while ([...jobs.values()].some((j) => j.at <= end)) {
      const [id, job] = [...jobs].sort((a, b) => a[1].at - b[1].at)[0];
      time = job.at;
      jobs.delete(id);
      job.fn();
    }
    time = end;
  };
  let controller;
  controller = new FourStopController({
    read: () => ({ ...state }),
    clock,
    scrollTo: (y) => {
      state.progress = (y - state.top) / state.travel;
      writes.push(y);
      controller.onScroll();
    },
  });
  return { controller, state, writes, advance, jobs };
}

test('nearest visual stop is symmetric, bounded and independent of milestone starts', () => {
  for (const [value, expected] of [
    [-1, 0],
    [0.2, 0],
    [0.29, 1],
    [0.48, 2],
    [0.7, 2],
    [0.89, 3],
    [2, 3],
  ])
    assert.equal(nearestStop(value), expected);
});

test('a stopped user scroll settles once and its own events cannot restart snapping', () => {
  const f = fixture();
  f.controller.input({ type: 'wheel' });
  f.controller.onScroll();
  f.advance(200);
  assert.equal(f.writes.length, 0);
  f.advance(1200);
  assert.ok(Math.abs(f.state.progress - 0.35) < 0.00001);
  const count = f.writes.length;
  f.advance(3000);
  assert.equal(f.writes.length, count);
  assert.equal(f.jobs.size, 0);
});

test('programmatic navigation, intro, exit and off-panel scrolling are never pulled back', () => {
  const f = fixture();
  f.controller.onScroll();
  f.advance(2000);
  assert.equal(f.writes.length, 0);
  for (const progress of [0, 1]) {
    f.state.progress = progress;
    f.controller.input({ type: 'wheel' });
    f.controller.onScroll();
    f.advance(2000);
  }
  f.state.progress = 0.43;
  f.state.pinned = false;
  f.controller.input({ type: 'wheel' });
  f.controller.onScroll();
  f.advance(2000);
  assert.equal(f.writes.length, 0);
});

test('new wheel input and rotation cancel an in-flight animation immediately', () => {
  const f = fixture();
  f.controller.goTo(3);
  f.advance(96);
  assert.ok(f.state.progress > 0.43 && f.state.progress < 0.925);
  f.controller.input({ type: 'wheel' });
  const count = f.writes.length;
  f.advance(2000);
  assert.equal(f.writes.length, count);
  f.controller.goTo(0);
  f.advance(64);
  f.controller.cancel();
  const after = f.writes.length;
  f.advance(2000);
  assert.equal(f.writes.length, after);
});

test('rapid dot selection uses only the latest target and moves monotonically', () => {
  const f = fixture();
  f.controller.goTo(0);
  f.advance(80);
  f.controller.goTo(3);
  const start = f.writes.length;
  f.advance(1000);
  assert.ok(Math.abs(f.state.progress - 0.925) < 0.00001);
  assert.ok(f.writes.slice(start).every((v, i, a) => i === 0 || v >= a[i - 1]));
});

test('touch momentum waits for release and keyboard scrolling follows the same rule', () => {
  const f = fixture(0.7);
  f.controller.input({ type: 'touchstart' });
  f.controller.input({ type: 'touchmove' });
  f.controller.onScroll();
  f.advance(1000);
  assert.equal(f.writes.length, 0);
  f.controller.input({ type: 'touchend' });
  f.advance(1200);
  assert.ok(Math.abs(f.state.progress - 0.575) < 0.00001);
  f.state.progress = 0.3;
  f.controller.input({ type: 'keydown', key: 'PageDown' });
  f.controller.onScroll();
  f.advance(1200);
  assert.ok(Math.abs(f.state.progress - 0.35) < 0.00001);
});

test('dispose cancels timers and animation without touching the page afterwards', () => {
  const f = fixture();
  f.controller.input({ type: 'wheel' });
  f.controller.onScroll();
  f.controller.dispose();
  f.advance(2000);
  assert.equal(f.writes.length, 0);
  f.controller.goTo(2);
  f.advance(2000);
  assert.equal(f.writes.length, 0);
});

test('editable fields and prevented keys do not arm settling; non-element event targets are safe', () => {
  const f = fixture();
  f.controller.input({
    type: 'keydown',
    key: 'PageDown',
    target: { closest: () => ({}) },
  });
  f.controller.onScroll();
  f.advance(1000);
  assert.equal(f.writes.length, 0);
  f.controller.input({ type: 'keydown', key: 'PageDown', defaultPrevented: true });
  f.controller.onScroll();
  f.advance(1000);
  assert.equal(f.writes.length, 0);
  f.controller.input({ type: 'keydown', key: 'PageDown', target: {} });
  f.controller.onScroll();
  f.advance(1200);
  assert.ok(Math.abs(f.state.progress - 0.35) < 0.00001);
});

test('gentle outward scrolling beyond the first and last stops never snaps back', () => {
  for (const [origin, next] of [
    [0.175, 0.15],
    [0.925, 0.95],
  ]) {
    const f = fixture(origin);
    f.controller.input({ type: 'wheel' });
    f.state.progress = next;
    f.controller.onScroll();
    f.advance(2000);
    assert.equal(f.writes.length, 0);
    assert.equal(f.state.progress, next);
  }
});

test('outward intent survives compositor scrolling before the passive wheel handler', () => {
  for (const [progress, deltaY] of [
    [0.15, -100],
    [0.95, 100],
  ]) {
    const f = fixture(progress);
    f.controller.input({ type: 'wheel', deltaY });
    f.controller.onScroll();
    f.advance(2000);
    assert.equal(f.writes.length, 0);
  }
});
