import React from 'react';

export default function ScenePoster({ eager = false }) {
  return (
    <picture className="journey-poster">
      <source
        type="image/avif"
        srcSet="/images/hero-ritual-960.avif 960w, /images/hero-ritual.avif 1672w"
        sizes="(max-width: 1199px) 100vw, (min-width: 2200px) 1200px, 65vw"
      />
      <img
        src="/images/hero-ritual.webp"
        srcSet="/images/hero-ritual-960.webp 960w, /images/hero-ritual.webp 1672w"
        sizes="(max-width: 1199px) 100vw, (min-width: 2200px) 1200px, 65vw"
        alt="Sıcak ışıkta ahşap tepsi üzerinde Türk kahvesi, bakır cezve ve kahve çekirdekleri"
        width="1672"
        height="941"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
      />
    </picture>
  );
}
