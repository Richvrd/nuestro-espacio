'use client';

import { useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';

export interface AnniversaryEventHandle {
  trigger: () => void;
}

function createHeartParticle() {
  const symbols = ['♥', '♡', '❤', '💕'];
  const colors = ['#f472b6', '#a78bfa', '#f9a8d4', '#c4b5fd'];
  const el = document.createElement('span');
  el.className = 'heart-particle';
  el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  el.style.setProperty('--size', (12 + Math.random() * 18) + 'px');
  el.style.setProperty('--rise', -(200 + Math.random() * 300) + 'px');
  el.style.setProperty('--rot', (Math.random() * 40 - 20) + 'deg');
  el.style.setProperty('--dur', (2.5 + Math.random() * 1.5) + 's');
  el.style.setProperty('--delay', '0s');
  el.style.color = colors[Math.floor(Math.random() * colors.length)];
  el.style.left = (Math.random() * 80 + 10) + '%';
  el.style.bottom = '0';
  return el;
}

function spawnParticles(count: number) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = createHeartParticle();
    p.style.setProperty('--delay', (Math.random() * 0.4) + 's');
    fragment.appendChild(p);
  }
  document.body.appendChild(fragment);
  const spans = fragment.children;
  for (let i = 0; i < spans.length; i++) {
    const el = spans[i] as HTMLElement;
    const dur = parseFloat(el.style.getPropertyValue('--dur')) * 1000;
    setTimeout(() => el.remove(), dur + 200);
  }
}

function createShockwave(index: number) {
  const el = document.createElement('div');
  el.className = `shockwave ring${index + 1}`;
  return el;
}

const AnniversaryEvent = forwardRef<AnniversaryEventHandle, object>(function AnniversaryEvent(_props, ref) {
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const supernovaRef = useRef<HTMLDivElement>(null);

  const cleanup = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    document.querySelectorAll('.shockwave, .heart-particle').forEach(el => el.remove());
    document.querySelectorAll('.s.event-bright').forEach(el => el.classList.remove('event-bright'));
    if (supernovaRef.current) supernovaRef.current.classList.remove('active');
  }, []);

  const trigger = useCallback(() => {
    cleanup();

    // t=0: Supernova flash + shockwave
    if (supernovaRef.current) supernovaRef.current.classList.add('active');
    const rings = [0, 1, 2].map(i => createShockwave(i));
    rings.forEach(r => document.body.appendChild(r));
    timerRef.current.push(setTimeout(() => {
      rings.forEach(r => r.remove());
    }, 2400));

    // t=0: Brighten stars
    document.querySelectorAll('.s').forEach(el => el.classList.add('event-bright'));
    timerRef.current.push(setTimeout(() => {
      document.querySelectorAll('.s.event-bright').forEach(el => el.classList.remove('event-bright'));
    }, 2800));

    // t=0: Start meteor storm via custom event
    window.dispatchEvent(new CustomEvent('celebracion:storm-start'));

    // t=0: Heart mode on orbit
    window.dispatchEvent(new CustomEvent('celebracion:heart-mode', { detail: { active: true } }));

    // t=400ms: First particle wave
    timerRef.current.push(setTimeout(() => spawnParticles(28), 400));

    // t=1400ms: Second particle wave
    timerRef.current.push(setTimeout(() => spawnParticles(16), 1400));

    // t=5000ms: Storm stops (handled by ShootingStars)

    // t=60000ms: Heart mode off
    timerRef.current.push(setTimeout(() => {
      window.dispatchEvent(new CustomEvent('celebracion:heart-mode', { detail: { active: false } }));
    }, 60000));

    // t=60800ms: Full cleanup (after 800ms transition)
    timerRef.current.push(setTimeout(() => cleanup(), 60800));
  }, [cleanup]);

  useImperativeHandle(ref, () => ({ trigger }), [trigger]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return <div id="supernova" ref={supernovaRef} />;
});

export default AnniversaryEvent;