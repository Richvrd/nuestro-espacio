'use client';

import { useEffect, useState, useRef } from 'react';

const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);

export function useScrollReveal(sectionCount: number) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (done) return;
    const el = document.getElementById('main');
    if (!el) return;

    const tick = () => {
      const max = Math.max(el.scrollHeight - el.clientHeight - 80, 0);
      if (max <= 0) return;
      const p = Math.min(1, Math.max(0, el.scrollTop / max));
      setProgress(p);
      if (p >= 1) setDone(true);
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        raf.current = requestAnimationFrame(() => { ticking = false; tick(); });
        ticking = true;
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    tick();

    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [done]);

  function styleFor(idx: number): React.CSSProperties {
    if (done) return {};
    const offset = idx * 0.14;
    const raw = (progress - offset) / (1 - offset);
    const p = Math.max(0, Math.min(1, raw));
    const e = EASE_OUT(p);
    return {
      opacity: e,
      transform: `translateY(${(1 - e) * 40}px)`,
    };
  }

  return { progress, done, styleFor };
}
