import React from 'react';
import { jumpToSection } from '../navigation.mjs';
import { milestones } from './timeline.mjs';

export default function ReducedStory() {
  return (
    <section
      id="kahve-yolculugu"
      className="journey-reduced wrap"
      aria-label="Yâren kahve hikâyesi"
    >
      <a className="journey-close" href="#kahveler" onClick={jumpToSection}>
        Hikâyeyi atla ↓
      </a>
      {milestones.map((milestone, index) => (
        <article key={milestone.label}>
          <img
            className="journey-still"
            src={`/video/still-0${index + 2}.webp`}
            width="1280"
            height="720"
            loading="lazy"
            alt={milestone.imageAlt}
          />
          <div>
            <p className="eyebrow">
              {String(index + 1).padStart(2, '0')} / 04 · {milestone.label}
            </p>
            <h2>{milestone.title}</h2>
            <p className="journey-subtitle">{milestone.subtitle}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
