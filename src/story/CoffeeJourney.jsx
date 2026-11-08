import React from 'react';
import PinnedScene from './PinnedScene.jsx';
import ReducedStory from './ReducedStory.jsx';
import ScenePoster from './ScenePoster.jsx';
import useMediaQuery from './useMediaQuery.js';
import './journey.css';

export default function CoffeeJourney({ children }) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const discover = () => {
    const section = document.getElementById('kahve-yolculugu');
    section.scrollIntoView({ behavior: 'instant', block: 'start' });
    section.querySelector('.journey-close').focus({ preventScroll: true });
  };
  return (
    <>
      <section className="hero wrap" aria-labelledby="hero-title">
        {children}
        <figure className="hero-figure journey-intro">
          <button
            className="journey-trigger hero-media"
            type="button"
            onClick={discover}
            aria-label="Kahve hikâyesini keşfet"
            aria-controls="kahve-yolculugu"
          >
            <ScenePoster eager />
          </button>
        </figure>
        <a
          className="journey-discover"
          href="#kahve-yolculugu"
          onClick={(event) => {
            event.preventDefault();
            discover();
          }}
        >
          KEŞFET <span aria-hidden="true">↓</span>
        </a>
      </section>
      {reduced ? <ReducedStory /> : <PinnedScene />}
    </>
  );
}
