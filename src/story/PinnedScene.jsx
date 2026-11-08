import React, { useCallback, useEffect, useRef, useState } from 'react';
import { jumpToSection } from '../navigation.mjs';
import JourneyMedia from './JourneyMedia.jsx';
import CinematicAnnotation from './CinematicAnnotation.jsx';
import { FourStopController } from './four-stop.mjs';
import {
  milestones,
  milestoneForProgress,
  portraitQuery,
  scrollProgress,
} from './timeline.mjs';

export default function PinnedScene() {
  const panelRef = useRef(null);
  const stageRef = useRef(null);
  const mediaRef = useRef(null);
  const annotationRef = useRef(null);
  const stopsRef = useRef(null);
  const phaseRef = useRef(0);
  const [phase, setPhase] = useState(0);
  const handleFrame = useCallback((time, options) => {
    annotationRef.current?.update(time, options);
    const next = milestoneForProgress(time / 10);
    if (next !== phaseRef.current) {
      phaseRef.current = next;
      setPhase(next);
    }
  }, []);
  const [status, setStatus] = useState('loading');

  const [mediaEnabled, setMediaEnabled] = useState(false);
  const [storyVisible, setStoryVisible] = useState(false);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let idle = 0;
    let timer = 0;
    // Critical opening assets finish first. Two paints and an idle task keep
    // the selected, low-priority MP4 preparation off the hero's initial render.
    const hero = document.querySelector('.hero img');
    Promise.all([hero?.decode().catch(() => {}), document.fonts.ready]).then(() => {
      if (disposed) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const prepare = () => {
            if (!disposed) setMediaEnabled(true);
          };
          if (window.requestIdleCallback)
            idle = requestIdleCallback(prepare, { timeout: 1200 });
          else timer = setTimeout(prepare, 300);
        });
      });
    });
    // Reduced motion unmounts this panel and cancels pending preparation.
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const escape = (event) => {
      const rect = panelRef.current.getBoundingClientRect();
      if (
        event.key !== 'Escape' ||
        event.defaultPrevented ||
        rect.top > 0 ||
        rect.bottom < innerHeight
      )
        return;
      // Only the visible story responds; form and recommender interactions are untouched.
      const target = document.getElementById('kahveler');
      stopsRef.current?.cancel();
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      target.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);

  useEffect(() => {
    let queued = 0;
    let previousWidth = innerWidth;
    let previousStageHeight = stageRef.current.offsetHeight;
    let previousPortrait = matchMedia(portraitQuery).matches;
    let previousProgress = 0;
    let wasPinned = false;
    const read = () => {
      const panel = panelRef.current;
      const rect = panel.getBoundingClientRect();
      const height = stageRef.current.offsetHeight;
      return {
        progress: scrollProgress(scrollY, rect.top + scrollY, panel.offsetHeight, height),
        top: rect.top + scrollY,
        travel: panel.offsetHeight - height,
        pinned: rect.top <= 1 && rect.bottom >= height - 1,
      };
    };
    const stops = new FourStopController({
      read,
      scrollTo: (top) => window.scrollTo({ top, behavior: 'instant' }),
    });
    stopsRef.current = stops;
    const update = () => {
      queued = 0;
      const panel = panelRef.current;
      const rect = panel.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) setStoryVisible(true);
      if (
        scrollY > 0 &&
        rect.top < innerHeight * 1.15 &&
        rect.bottom > stageRef.current.offsetHeight * 0.25
      )
        setMediaEnabled(true);
      const sectionTop = rect.top + scrollY;
      const viewportHeight = stageRef.current.offsetHeight;
      let progress = scrollProgress(
        scrollY,
        sectionTop,
        panel.offsetHeight,
        viewportHeight,
      );
      // Rotation changes both the hero offset and the sticky travel distance.
      // Preserve the viewed moment when real viewport geometry or format changes.
      // Browser-bar height changes that leave 100svh stable remain native.
      const portrait = matchMedia(portraitQuery).matches;
      if (
        (innerWidth !== previousWidth ||
          viewportHeight !== previousStageHeight ||
          portrait !== previousPortrait) &&
        wasPinned
      ) {
        progress = previousProgress;
        window.scrollTo({
          top: sectionTop + (panel.offsetHeight - viewportHeight) * progress,
          behavior: 'instant',
        });
      }
      previousWidth = innerWidth;
      previousStageHeight = viewportHeight;
      previousPortrait = portrait;
      previousProgress = progress;
      const updatedRect = panel.getBoundingClientRect();
      wasPinned = updatedRect.top <= 1 && updatedRect.bottom >= viewportHeight - 1;
      mediaRef.current?.seek(progress);
      stops.onScroll();
    };
    const schedule = () => {
      if (!queued) queued = requestAnimationFrame(update);
    };
    const input = (event) => stops.input(event);
    const resize = () => {
      stops.cancel();
      schedule();
    };
    const navigate = (event) => {
      if (event.target.closest('a[href^="#"]')) stops.cancel();
    };
    const visibility = () => {
      if (document.hidden) stops.cancel();
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    for (const type of [
      'wheel',
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'pointerdown',
      'keydown',
    ])
      window.addEventListener(type, input, { passive: true });
    document.addEventListener('click', navigate, true);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      stops.dispose();
      stopsRef.current = null;
      cancelAnimationFrame(queued);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      for (const type of [
        'wheel',
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel',
        'pointerdown',
        'keydown',
      ])
        window.removeEventListener(type, input);
      document.removeEventListener('click', navigate, true);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  return (
    <section
      id="kahve-yolculugu"
      ref={panelRef}
      className={`journey-panel ${status === 'error' ? 'has-error' : ''}`}
      aria-label="Yâren kahve hikâyesi"
      aria-describedby="journey-instructions"
    >
      <div ref={stageRef} className="journey-stage">
        <JourneyMedia
          ref={mediaRef}
          enabled={mediaEnabled}
          onStatus={setStatus}
          onFrame={handleFrame}
        />
        <a href="#kahveler" className="journey-close" onClick={jumpToSection}>
          Hikâyeyi atla <span aria-hidden="true">↓</span>
        </a>
        <CinematicAnnotation ref={annotationRef} enabled={storyVisible} />
        {storyVisible && (
          <nav className="journey-stops" aria-label="Sinematik sahneler">
            {milestones.map((milestone, index) => (
              <button
                key={milestone.label}
                type="button"
                aria-label={`${index + 1} / 4 · ${['Çekirdek', 'Cezve', 'Fincan', 'Paylaşım'][index]}`}
                aria-current={phase === index ? 'step' : undefined}
                onClick={() => stopsRef.current?.goTo(index)}
                onKeyDown={(event) => {
                  const next = {
                    ArrowUp: (index + 3) % 4,
                    ArrowDown: (index + 1) % 4,
                    Home: 0,
                    End: 3,
                  }[event.key];
                  if (next === undefined) return;
                  event.preventDefault();
                  event.currentTarget.parentElement.children[next].focus({
                    preventScroll: true,
                  });
                  stopsRef.current?.goTo(next);
                }}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </nav>
        )}
        {mediaEnabled && status !== 'ready' && (
          <div
            className={`journey-status ${status === 'loading' ? 'visually-hidden' : ''}`}
            role="status"
            aria-live="polite"
          >
            {status === 'loading' &&
              'Video hazırlanıyor. Kaydırarak hikâyeyi keşfedebilirsiniz.'}
            {status === 'error' && 'Medya yüklenemedi. Görsellerle devam edebilirsiniz.'}
          </div>
        )}
        <div className="visually-hidden">
          <p id="journey-instructions">
            Kaydırarak kahve hikâyesini keşfedin. Geriye kaydırarak geri dönebilir, Escape
            veya Hikâyeyi atla bağlantısıyla kahvelerimize geçebilirsiniz.
          </p>
          <ol>
            {milestones.map((milestone) => (
              <li key={milestone.label}>
                {milestone.title} {milestone.subtitle}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
