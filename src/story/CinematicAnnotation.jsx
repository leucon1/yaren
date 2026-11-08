import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { milestones, milestoneForProgress } from './timeline.mjs';
import { introVisibility, labelPosition } from './annotation-layout.mjs';

const CinematicAnnotation = forwardRef(function CinematicAnnotation({ enabled }, ref) {
  const rootRef = useRef(null),
    labelRef = useRef(null),
    brandRef = useRef(null);
  const clockRef = useRef({ time: 0, staticFrame: true });
  const phaseRef = useRef(0);
  const [phase, setPhase] = useState(0);

  const position = () => {
    const root = rootRef.current,
      label = labelRef.current;
    if (!root || !label) return;
    const { width, height } = root.getBoundingClientRect();
    const { time, staticFrame, portraitVideo } = clockRef.current;
    const placement = labelPosition(
      phaseRef.current,
      width,
      height,
      label.offsetWidth,
      label.offsetHeight,
      portraitVideo,
    );
    label.style.left = `${placement.x}px`;
    label.style.top = `${placement.y}px`;
    // Both layers share the presented-frame clock. Nothing advances while idle.
    const intro = introVisibility(time);
    brandRef.current.style.opacity = String(intro.logo);
    label.style.opacity = String(intro.caption);
    root.dataset.time = time.toFixed(5);
    root.dataset.staticFrame = String(staticFrame);
    root.dataset.phase = String(phaseRef.current);
  };

  useImperativeHandle(ref, () => ({
    update(time, { staticFrame = false, portraitVideo = false } = {}) {
      clockRef.current = { time, staticFrame, portraitVideo };
      const next = milestoneForProgress(time / 10);
      if (phaseRef.current !== next) {
        phaseRef.current = next;
        setPhase(next);
      }
      position();
    },
  }));

  useLayoutEffect(() => {
    position();
    // Phase zero is exclusively progress-driven so its logo handoff cannot
    // be overridden by a timed entrance, including when scrolling backwards.
    if (phase === 0) return;
    // A gentle entrance never makes a stationary caption unreadable.
    const text = labelRef.current.animate([{ opacity: 0.8 }, { opacity: 1 }], {
      duration: 220,
      easing: 'ease-out',
    });
    return () => text.cancel();
  }, [phase]);

  useEffect(() => {
    const observer = new ResizeObserver(position);
    observer.observe(rootRef.current);
    observer.observe(labelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="journey-annotation"
      aria-hidden="true"
      data-time="0.00000"
      data-phase="0"
    >
      <div ref={brandRef} className="journey-brand">
        {enabled && <img src="/images/yaren-logo.png" width="2172" height="724" alt="" />}
      </div>
      <div ref={labelRef} className="journey-caption">
        <p className="eyebrow">
          {String(phase + 1).padStart(2, '0')} / 04 · {milestones[phase].label}
        </p>
        <h2>{milestones[phase].title}</h2>
        <p className="journey-subtitle">{milestones[phase].subtitle}</p>
      </div>
      <p className="journey-scroll-hint">
        {phase === 3 ? 'BİR SONRAKİ FİNCAN İÇİN KAYDIRIN' : 'KAYDIRARAK DEVAM EDİN'}
      </p>
    </div>
  );
});

export default CinematicAnnotation;
