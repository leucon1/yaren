import React from 'react';

export function Arrow({ diagonal = false }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <img
      className="logo"
      src="/images/yaren-logo-270.webp"
      srcSet="/images/yaren-logo-270.webp 270w, /images/yaren-logo-540.webp 540w"
      sizes="(max-width: 899px) 120px, 170px"
      alt="yâren"
      width="540"
      height="180"
    />
  );
}
