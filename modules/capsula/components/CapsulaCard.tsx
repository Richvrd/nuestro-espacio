'use client';

import { useState, useEffect, useRef } from 'react';
import { Capsule, getCapsuleStatus } from '../types';

interface CapsulaCardProps {
  capsule: Capsule;
  index: number;
  onClick: () => void;
  justOpened: boolean;
}

function calcDiff(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const total = Math.floor(diff / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function CapsulaCard({ capsule, index, onClick, justOpened }: CapsulaCardProps) {
  const status = getCapsuleStatus(capsule);
  const target = new Date(capsule.open_date);
  const [diff, setDiff] = useState(() => calcDiff(target));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === 'open') return;
    let lastTick = performance.now();
    const tick = (now: number) => {
      if (now - lastTick >= 1000) {
        setDiff(calcDiff(target));
        lastTick = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [capsule.open_date, status]);

  const statusClass = status === 'open' ? 'abierta' : 'sellada';

  return (
    <div className={`capsula-card ${statusClass}${justOpened ? ' just-opened' : ''}`} style={{ '--stagger-i': index } as React.CSSProperties} onClick={onClick}>
      <div className="card-state">
        {status === 'open' ? '💌 abierta' : '🔒 sellada'}
      </div>
      <div className="card-subject">{capsule.subject}</div>
      <div className="card-para">para · {capsule.to_name}</div>
      <div className="card-divider" />
      {status === 'sealed' ? (
        <div className="card-countdown">
          <CountUnit value={diff.d} label="días" />
          <span className="cdc-sep">:</span>
          <CountUnit value={diff.h} label="hrs" />
          <span className="cdc-sep">:</span>
          <CountUnit value={diff.m} label="min" />
          <span className="cdc-sep">:</span>
          <CountUnit value={diff.s} label="seg" sec />
        </div>
      ) : (
        <div className="card-open-date">
          se abrió el {new Date(capsule.open_date).toLocaleDateString('es-CL', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </div>
      )}
    </div>
  );
}

function CountUnit({ value, label, sec }: { value: number; label: string; sec?: boolean }) {
  return (
    <div className="cdc-unit">
      <span className={`cdc-val${sec ? ' sec-val' : ''}`}>{pad(value)}</span>
      <span className="cdc-label">{label}</span>
    </div>
  );
}
