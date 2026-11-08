import { useEffect, useState } from 'react';

export default function useRecommenderVisibility() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const coffees = document.getElementById('kahveler');
    let queued = 0;
    const update = () => {
      queued = 0;
      const editingForm = document.activeElement?.matches(
        '#iletisim input, #iletisim textarea, #iletisim select',
      );
      // The coffee section follows both the optional pinned story and its
      // reduced-motion alternative. Direct navigation reaches the same boundary.
      setVisible(
        !editingForm &&
          scrollY > 0 &&
          coffees.getBoundingClientRect().top <= innerHeight * 0.55,
      );
    };
    const schedule = () => {
      if (!queued) queued = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    return () => {
      cancelAnimationFrame(queued);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
    };
  }, []);

  return visible;
}
