'use client';

import { useCounter } from '@/hooks/useCounter';
import { Card } from '@/components/ui/Card';

function pad(num: number, size: number = 2): string {
  return num.toString().padStart(size, '0');
}

export function CounterDisplay() {
  const { years, months, weeks, days, hours, minutes, seconds } = useCounter();

  return (
    <Card className="counter-card">
      <div>
        <span className="counter-label">tiempo juntos</span>
        <div className="counter-units">
          <div className="cu">
            <span className="cu-val">{pad(years)}</span>
            <span className="cu-label">años</span>
          </div>
          <span className="counter-sep">·</span>
          <div className="cu">
            <span className="cu-val">{pad(months)}</span>
            <span className="cu-label">meses</span>
          </div>
          <span className="counter-sep">·</span>
          <div className="cu">
            <span className="cu-val">{pad(weeks)}</span>
            <span className="cu-label">semanas</span>
          </div>
          <span className="counter-sep">·</span>
          <div className="cu">
            <span className="cu-val">{pad(days)}</span>
            <span className="cu-label">días</span>
          </div>
          <span className="counter-sep">·</span>
          <div className="cu">
            <span className="cu-val">{pad(hours)}</span>
            <span className="cu-label">horas</span>
          </div>
          <span className="counter-sep">·</span>
          <div className="cu">
            <span className="cu-val">{pad(minutes)}</span>
            <span className="cu-label">min</span>
          </div>
          <span className="counter-sep">·</span>
          <div className="cu">
            <span className="cu-val">{pad(seconds)}</span>
            <span className="cu-label">seg</span>
          </div>
        </div>
      </div>
      <div className="counter-right">
        <span className="counter-label">desde</span>
        <span className="counter-since">7 feb 2026 · 4:45</span>
      </div>
    </Card>
  );
}
