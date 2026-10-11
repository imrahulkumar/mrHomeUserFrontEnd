import { useEffect, useRef, useState } from 'react';

/**
 * Fades its content in the first time it scrolls into view. Whether it animates at all is decided in CSS
 * (html[data-reveal] and prefers-reduced-motion), so this only toggles the class.
 */
export default function Reveal({ children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setShown(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`reveal ${shown ? 'is-shown' : ''}`}>{children}</div>;
}
