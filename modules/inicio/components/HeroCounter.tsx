'use client';

import { useCounter } from '@/hooks/useCounter';
import { COUPLE } from '@/lib/constants';

function pad(num: number, size: number = 2): string {
  return num.toString().padStart(size, '0');
}

export function HeroCounter() {
  const { years, months, days, hours, minutes, seconds } = useCounter();

  const sinceDate = COUPLE.startDate.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).replace(/\.$/, '');
  const sinceTime = COUPLE.startDate.toLocaleTimeString('es-ES', {
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <div className="hero-counter">
      <div className="hero-counter-units">
        <div className="hcu">
          <span className="hcu-val">{years}</span>
          <span className="hcu-label">años</span>
        </div>
        <span className="hcu-sep">:</span>
        <div className="hcu">
          <span className="hcu-val">{pad(months)}</span>
          <span className="hcu-label">meses</span>
        </div>
        <span className="hcu-sep">:</span>
        <div className="hcu">
          <span className="hcu-val">{pad(days)}</span>
          <span className="hcu-label">días</span>
        </div>
      </div>
      <div className="hero-counter-sub">
        <span className="hcu-val hcu-val--sm">{pad(hours)}</span>
        <span className="hcu-label">horas</span>
        <span className="hcu-sep hcu-sep--sm">:</span>
        <span className="hcu-val hcu-val--sm">{pad(minutes)}</span>
        <span className="hcu-label">min</span>
        <span className="hcu-sep hcu-sep--sm">:</span>
        <span className="hcu-val hcu-val--sm">{pad(seconds)}</span>
        <span className="hcu-label">seg</span>
      </div>
      <div className="hero-counter-since">{sinceDate} · {sinceTime}</div>
    </div>
  );
}
