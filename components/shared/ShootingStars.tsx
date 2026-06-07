'use client';

import { useEffect, useRef } from 'react';

function launchShootingStar(storm = false) {
  const s = document.createElement('div');
  s.className = 'shooting-star';

  const len   = storm ? 120 + Math.random() * 160 : 80 + Math.random() * 140;
  const angle = storm ? -(5 + Math.random() * 40) : -(10 + Math.random() * 20);
  const dur   = (storm ? 0.8 + Math.random() * 0.6 : 1.0 + Math.random() * 0.8).toFixed(2) + 's';
  const y     = (Math.random() * 100) + '%';

  s.style.setProperty('--len', len + 'px');
  s.style.setProperty('--angle', angle + 'deg');
  s.style.setProperty('--dur', dur);
  s.style.setProperty('--y', y);

  document.body.appendChild(s);
  setTimeout(() => s.remove(), 2200);
}

export function ShootingStars() {
  const normalChainsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stormChainsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isStormRef = useRef(false);

  useEffect(() => {
    function startNormal() {
      stopAll();
      isStormRef.current = false;
      normalChainsRef.current = [0, 1, 2].map(() =>
        setTimeout(function run() {
          if (isStormRef.current) return;
          launchShootingStar(false);
          setTimeout(run, 1500 + Math.random() * 3500);
        }, Math.random() * 3000)
      );
    }

    function startStorm() {
      stopAll();
      isStormRef.current = true;
      for (let i = 0; i < 12; i++) {
        const delay = Math.random() * 5000;
        stormChainsRef.current.push(
          setTimeout(function run() {
            if (!isStormRef.current) return;
            launchShootingStar(true);
            const nextDelay = 180 + Math.random() * 420;
            stormChainsRef.current.push(setTimeout(run, nextDelay));
          }, delay)
        );
      }
      setTimeout(stopStorm, 5000);
    }

    function stopStorm() {
      isStormRef.current = false;
      stormChainsRef.current.forEach(clearTimeout);
      stormChainsRef.current = [];
      startNormal();
    }

    function stopAll() {
      normalChainsRef.current.forEach(clearTimeout);
      normalChainsRef.current = [];
      stormChainsRef.current.forEach(clearTimeout);
      stormChainsRef.current = [];
    }

    function handleStormStart() { startStorm(); }

    startNormal();

    window.addEventListener('celebracion:storm-start', handleStormStart);
    return () => {
      stopAll();
      window.removeEventListener('celebracion:storm-start', handleStormStart);
    };
  }, []);

  return null;
}
