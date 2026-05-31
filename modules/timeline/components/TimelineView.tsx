'use client';

import { useMemo } from 'react';
import type { Moment } from '../types';
import { getMomentYear } from '../types';
import { MomentCard } from './MomentCard';
import { AddBetweenButton } from './AddBetweenButton';
import { YearSeparator } from './YearSeparator';

interface TimelineViewProps {
  moments: Moment[];
  viewMode: 'compact' | 'expanded';
  onAddBetween: (prevDate: string | null, nextDate: string | null) => void;
  onEdit: (moment: Moment) => void;
  onDelete: (momentId: string) => void;
}

const PARTICLE_COUNT = 18;

function createParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    top: `${(i / PARTICLE_COUNT) * 100}%`,
    dur: `${4 + (i * 0.27) % 5}s`,
    delay: `${(i * 0.43) % 8}s`,
  }));
}

export function TimelineView({ moments, viewMode, onAddBetween, onEdit, onDelete }: TimelineViewProps) {
  const particles = useMemo(() => createParticles(), []);

  if (moments.length === 0) {
    return (
      <div className="timeline" style={{ position: 'relative' }}>
        <div className="timeline-particles">
          {particles.map((p, i) => (
            <div key={i} className="tp" style={{ top: p.top, '--dur': p.dur, '--delay': p.delay } as React.CSSProperties} />
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '3rem 0', fontFamily: 'var(--body)', fontSize: '0.85rem', color: 'var(--muted)' }}>
          no hay momentos para este año todavía.
        </div>
      </div>
    );
  }

  const items: React.ReactNode[] = [];

  items.push(
    <AddBetweenButton key="add-start" prevDate={null} nextDate={moments[0].date} onClick={onAddBetween} />
  );

  let prevYear: number | null = null;

  moments.forEach((m, i) => {
    const year = getMomentYear(m);

    if (prevYear !== null && year !== prevYear) {
      items.push(<YearSeparator key={`ys-${year}`} year={year} />);
    } else if (prevYear === null) {
      // First year separator
      items.push(<YearSeparator key={`ys-${year}`} year={year} />);
    }

    const side = i % 2 === 0 ? 'left' : 'right';

    items.push(
      <MomentCard
        key={m.id}
        moment={m}
        side={side}
        viewMode={viewMode}
        onEdit={() => onEdit(m)}
        onDelete={() => onDelete(m.id)}
      />
    );

    const nextDate = i < moments.length - 1 ? moments[i + 1].date : null;
    items.push(
      <AddBetweenButton
        key={`add-${m.id}`}
        prevDate={m.date}
        nextDate={nextDate}
        onClick={onAddBetween}
      />
    );

    prevYear = year;
  });

  return (
    <div className="timeline">
      <div className="timeline-particles">
        {particles.map((p, i) => (
          <div key={i} className="tp" style={{ top: p.top, '--dur': p.dur, '--delay': p.delay } as React.CSSProperties} />
        ))}
      </div>
      {items}
      <div className="tl-end">
        <div className="tl-end-dot" />
        <div className="tl-end-label">la historia continúa</div>
      </div>
    </div>
  );
}
