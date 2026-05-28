'use client';

import { useEffect } from 'react';

function launchShootingStar() {
  const s = document.createElement('div');
  s.className = 'shooting-star';

  const len   = 80 + Math.random() * 140;
  const angle = -(10 + Math.random() * 20);
  const dur   = (1.0 + Math.random() * 0.8).toFixed(2) + 's';
  const y     = (Math.random() * 100) + '%';

  s.style.setProperty('--len', len + 'px');
  s.style.setProperty('--angle', angle + 'deg');
  s.style.setProperty('--dur', dur);
  s.style.setProperty('--y', y);

  document.body.appendChild(s);
  setTimeout(() => s.remove(), 2200);
}

export function ShootingStars() {
  useEffect(() => {
    const chains = [0, 1, 2].map(() =>
      setTimeout(function run() {
        launchShootingStar();
        setTimeout(run, 1500 + Math.random() * 3500);
      }, Math.random() * 3000)
    );
    return () => chains.forEach(clearTimeout);
  }, []);

  return null;
}
