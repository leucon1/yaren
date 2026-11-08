// Native scrolling only for the recommender. The observer never drives position.
export function scrollToCoffee(target, onArrival) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    target.focus({ preventScroll: true });
    onArrival();
    return () => {};
  }

  const inset =
    (parseFloat(getComputedStyle(target).scrollMarginTop) || 0) +
    (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
  let frame = 0;
  let done = false;
  let stableFrames = 0;
  let previousY = scrollY;
  const started = performance.now();
  const interactionEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  const cleanUp = () => {
    cancelAnimationFrame(frame);
    interactionEvents.forEach((type) => window.removeEventListener(type, cancel));
  };
  const cancel = () => {
    if (done) return;
    done = true;
    cleanUp();
    // Respect a visitor who changes direction or moves focus during the trip.
    window.scrollTo({ top: scrollY, behavior: 'instant' });
  };
  const observe = () => {
    if (done) return;
    if (!target.isConnected || performance.now() - started > 4000) {
      cancel();
      return;
    }
    const destination = Math.max(
      0,
      Math.min(
        target.getBoundingClientRect().top + scrollY - inset,
        document.documentElement.scrollHeight - innerHeight,
      ),
    );
    const arrived = Math.abs(scrollY - destination) < 2;
    stableFrames = arrived && Math.abs(scrollY - previousY) < 0.5 ? stableFrames + 1 : 0;
    previousY = scrollY;
    if (stableFrames >= 3) {
      done = true;
      cleanUp();
      target.focus({ preventScroll: true });
      onArrival();
      return;
    }
    frame = requestAnimationFrame(observe);
  };

  interactionEvents.forEach((type) =>
    window.addEventListener(type, cancel, { passive: true }),
  );
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  frame = requestAnimationFrame(observe);
  return cancel;
}
