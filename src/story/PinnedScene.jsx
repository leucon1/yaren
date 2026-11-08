import React, { useCallback, useEffect, useRef, useState } from 'react';
import { jumpToSection } from '../navigation.mjs';
import JourneyMedia from './JourneyMedia.jsx';
import CinematicAnnotation from './CinematicAnnotation.jsx';
import { milestones, portraitQuery, scrollProgress } from './timeline.mjs';

export default function PinnedScene() {
  const panelRef = useRef(null);
  const stageRef = useRef(null);
  const mediaRef = useRef(null);
  const annotationRef = useRef(null);
  const handleFrame = useCallback(
    (time, options) => annotationRef.current?.update(time, options),
    [],
  );
  const [status, setStatus] = useState('loading');

  const [mediaEnabled, setMediaEnabled] = useState(false);

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
    const update = () => {
      queued = 0;
      const panel = panelRef.current;
      const rect = panel.getBoundingClientRect();
      if (
        scrollY > 0 &&
        rect.top < innerHeight &&
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
    };
    const schedule = () => {
      if (!queued) queued = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
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
        <CinematicAnnotation ref={annotationRef} enabled={mediaEnabled} />
        {mediaEnabled && status !== 'ready' && (
          <div className="journey-status" role="status" aria-live="polite">
            {status === 'loading' &&
              'Video hazırlanıyor. Kaydırarak hikâyeyi keşfedebilirsiniz.'}
            {status === 'error' &&
              'Medya yüklenemedi. Hikâyeyi görsellerle keşfedebilir veya atlayabilirsiniz.'}
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
