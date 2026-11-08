import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Arrow } from '../components/Brand.jsx';
import { scrollToCoffee } from './scroll-to-coffee.mjs';
import { recommendations } from './recommendations.mjs';
import useRecommenderVisibility from './useRecommenderVisibility.js';
import './recommender.css';

const question = 'Bugün nasıl hissediyorsun?';

function RecommenderPanel() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const firstOptionRef = useRef(null);
  const resultActionRef = useRef(null);
  const highlightRef = useRef(null);
  const scrollRef = useRef(null);
  const recommendation = recommendations.find((item) => item.id === selectedId);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    setSelectedId(null);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    if (open) (recommendation ? resultActionRef : firstOptionRef).current?.focus();
  }, [open, recommendation]);

  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!rootRef.current.contains(event.target)) close(false);
    };
    const escape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };
    document.addEventListener('pointerdown', outside);
    // Consume only the panel's Escape; the existing hero Escape stays intact.
    document.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape, true);
    };
  }, [open, close]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    return () => {
      scrollRef.current?.();
      const highlight = highlightRef.current;
      if (highlight) {
        clearTimeout(highlight.timeout);
        highlight.element.classList.remove('is-recommended');
      }
      // If returning to the hero hides a focused panel, keep focus in the page.
      // Form focus or another outside target must never be stolen.
      if (root.contains(document.activeElement)) {
        document.getElementById('icerik')?.focus({ preventScroll: true });
      }
    };
  }, []);

  const showCoffee = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const element = document.getElementById(recommendation.productId);
    if (!element) return;
    event.preventDefault();
    const href = event.currentTarget.getAttribute('href');
    if (location.hash !== href) history.pushState(null, '', href);
    close(false);
    scrollRef.current?.();
    const previous = highlightRef.current;
    if (previous) {
      clearTimeout(previous.timeout);
      previous.element.classList.remove('is-recommended');
    }
    scrollRef.current = scrollToCoffee(element, () => {
      scrollRef.current = null;
      element.classList.add('is-recommended');
      highlightRef.current = {
        element,
        timeout: setTimeout(() => {
          element.classList.remove('is-recommended');
          highlightRef.current = null;
        }, 2200),
      };
    });
  };

  return (
    <aside ref={rootRef} className="coffee-recommender" aria-label="Yâren kahve önerisi">
      {open && (
        <div
          id="coffee-recommender-panel"
          className="recommender-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="recommender-title"
        >
          <div className="recommender-heading">
            <div>
              <p className="eyebrow">
                {recommendation ? 'YÂREN’DEN SANA BİR ÖNERİ' : 'KÜÇÜK BİR KAHVE MOLASI'}
              </p>
              <h2
                id="recommender-title"
                className={recommendation ? 'visually-hidden' : undefined}
              >
                {question}
              </h2>
            </div>
            <button
              className="recommender-close"
              type="button"
              aria-label="Kahve önericisini kapat"
              onClick={() => close()}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <p
            className="visually-hidden"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {recommendation && `${recommendation.coffee}. ${recommendation.message}`}
          </p>
          {recommendation ? (
            <div className="recommender-result">
              <h3>
                Bugün sana bir <em>{recommendation.coffee}</em> iyi gider.
              </h3>
              <p>{recommendation.message}</p>
              <a
                ref={resultActionRef}
                href={`#${recommendation.productId}`}
                className="button primary recommender-view"
                onClick={showCoffee}
              >
                Kahveyi Gör <Arrow />
              </a>
              <button
                type="button"
                className="recommender-again"
                onClick={() => setSelectedId(null)}
              >
                Başka Bir Ruh Hâli Seç
              </button>
            </div>
          ) : (
            <ul className="recommender-options">
              {recommendations.map((item, index) => (
                <li key={item.id}>
                  <button
                    ref={index === 0 ? firstOptionRef : undefined}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    {item.mood}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button
        ref={triggerRef}
        className="recommender-launch"
        type="button"
        aria-expanded={open}
        aria-controls="coffee-recommender-panel"
        aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V7Zm12 1h2a3 3 0 0 1 0 6h-2M3 22h16M7 2v2m5-2v2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {question}
      </button>
    </aside>
  );
}

export default function CoffeeRecommender() {
  const visible = useRecommenderVisibility();
  return visible ? <RecommenderPanel /> : null;
}
