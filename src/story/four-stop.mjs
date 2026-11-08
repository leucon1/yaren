import { cinematicStops, clampProgress } from './timeline.mjs';

export function nearestStop(progress) {
  const time = clampProgress(progress) * 10;
  return cinematicStops.reduce(
    (nearest, stop, index) =>
      Math.abs(stop - time) < Math.abs(cinematicStops[nearest] - time) ? index : nearest,
    0,
  );
}

// Own only the brief, interruptible settling after a real user scroll.
// Video seeking and panel geometry remain owned by the existing components.
export class FourStopController {
  constructor({ read, scrollTo, clock = window }) {
    this.read = read;
    this.scrollTo = scrollTo;
    this.clock = clock;
    this.timer = null;
    this.frame = null;
    this.manual = false;
    this.inputProgress = 0;
    this.inputDirection = 0;
    this.touchY = null;
    this.touching = false;
    this.moving = false;
    this.disposed = false;
  }

  cancel() {
    this.clock.clearTimeout(this.timer);
    this.clock.cancelAnimationFrame(this.frame);
    this.timer = null;
    this.frame = null;
    this.manual = false;
    this.moving = false;
  }

  input(event) {
    if (this.disposed || event.defaultPrevented) return;
    if (event.type === 'touchend' || event.type === 'touchcancel') {
      this.touching = false;
      this.onScroll();
      return;
    }
    if (event.type === 'keydown') {
      if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]'))
        return;
      if (
        !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(
          event.key,
        )
      ) {
        this.cancel();
        return;
      }
    }
    this.cancel();
    this.inputProgress = this.read().progress;
    // A passive handler can run after compositor scrolling. Keep input intent
    // as well as position so gentle exits work in that ordering too.
    if (event.type === 'wheel') this.inputDirection = Math.sign(event.deltaY || 0);
    else if (event.type === 'keydown')
      this.inputDirection = ['ArrowUp', 'PageUp', 'Home'].includes(event.key) ? -1 : 1;
    else if (event.type === 'touchstart') {
      this.touchY = event.touches?.[0]?.clientY ?? null;
      this.inputDirection = 0;
    } else if (event.type === 'touchmove') {
      const y = event.touches?.[0]?.clientY ?? this.touchY;
      this.inputDirection = Math.sign(this.touchY - y) || this.inputDirection;
      this.touchY = y;
    } else this.inputDirection = 0;
    this.touching = event.type === 'touchstart' || event.type === 'touchmove';
    this.manual = ['wheel', 'touchmove', 'keydown'].includes(event.type);
  }

  canSettle(state) {
    if (!state.pinned || state.progress <= 0.005 || state.progress >= 0.995) return false;
    // Let even small, separate gestures leave the first/last stop naturally.
    // Otherwise nearest-stop settling would repeatedly undo a gentle exit.
    const direction =
      this.inputDirection || Math.sign(state.progress - this.inputProgress);
    const outward =
      (state.progress < cinematicStops[0] / 10 && direction < 0) ||
      (state.progress > cinematicStops.at(-1) / 10 && direction > 0);
    return !outward;
  }

  onScroll() {
    if (this.disposed || this.moving || !this.manual || this.touching) return;
    this.clock.clearTimeout(this.timer);
    const state = this.read();
    // Preserve the opening logo and natural entry/exit. Never pull the page
    // back into the panel, including after navigation or a fast fling.
    if (!this.canSettle(state)) return;
    this.timer = this.clock.setTimeout(() => {
      this.timer = null;
      const current = this.read();
      if (this.canSettle(current)) this.goTo(nearestStop(current.progress));
    }, 240);
  }

  goTo(index) {
    if (this.disposed || !Number.isInteger(index) || !cinematicStops[index]) return;
    this.cancel();
    const start = this.read();
    if (start.travel <= 0) return;
    const target = cinematicStops[index] / 10;
    const from = start.top + start.travel * start.progress;
    const to = start.top + start.travel * target;
    if (Math.abs(to - from) < 1) return;
    const began = this.clock.performance.now();
    const duration = Math.min(650, 300 + Math.abs(target - start.progress) * 1200);
    this.moving = true;
    const tick = (now) => {
      if (this.disposed || !this.moving) return;
      const t = Math.min(1, (now - began) / duration);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      this.scrollTo(from + (to - from) * eased);
      if (t < 1) this.frame = this.clock.requestAnimationFrame(tick);
      else {
        this.frame = null;
        this.moving = false;
      }
    };
    this.frame = this.clock.requestAnimationFrame(tick);
  }

  dispose() {
    this.cancel();
    this.disposed = true;
  }
}
