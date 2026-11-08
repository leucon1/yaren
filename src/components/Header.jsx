import React, { useEffect, useRef, useState } from 'react';
import { Logo } from './Brand.jsx';
import { jumpToSection } from '../navigation.mjs';

const links = [
  ['Kahvelerimiz', '#kahveler'],
  ['Hikâyemiz', '#hikayemiz'],
  ['İletişim', '#iletisim'],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  useEffect(() => {
    const mobile = matchMedia('(max-width: 899px)');
    const closeOnDesktop = (event) => {
      if (!event.matches) setOpen(false);
    };
    mobile.addEventListener('change', closeOnDesktop);
    return () => mobile.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <header className="header wrap">
      <a
        className="logo-link"
        href="#baslangic"
        aria-label="Yâren, ana sayfa"
        onClick={() => setOpen(false)}
      >
        <Logo />
      </a>
      <button
        ref={toggleRef}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Kapat' : 'Menü'}
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <nav
        id="main-nav"
        aria-label="Ana gezinme"
        className={open ? 'nav is-open' : 'nav'}
      >
        {links.map(([label, href]) => (
          <a
            href={href}
            key={href}
            onClick={(event) => {
              setOpen(false);
              jumpToSection(event);
            }}
          >
            {label}
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
