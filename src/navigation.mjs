// Explicit section navigation skips the pinned story in one native jump.
export function jumpToSection(event) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const href = event.currentTarget.getAttribute('href');
  const target = href?.startsWith('#') && document.getElementById(href.slice(1));
  if (!target) return;
  event.preventDefault();
  if (location.hash !== href) history.pushState(null, '', href);
  target.scrollIntoView({ behavior: 'instant', block: 'start' });
  target.focus({ preventScroll: true });
}
