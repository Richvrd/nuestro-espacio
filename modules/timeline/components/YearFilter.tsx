'use client';

import { useRef, useEffect } from 'react';

interface YearFilterProps {
  years: number[];
  momentCountByYear: Record<number, number>;
  selectedYear: number | 'all';
  onSelect: (year: number | 'all') => void;
}

export function YearFilter({ years, momentCountByYear, selectedYear, onSelect }: YearFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || selectedYear === 'all') return;
    const btn = el.querySelector(`[data-year="${selectedYear}"]`);
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedYear]);

  return (
    <div className="year-filter-wrap">
      <div className="year-filter" ref={scrollRef}>
        <button
          className={`yf-all${selectedYear === 'all' ? ' active' : ''}`}
          onClick={() => onSelect('all')}
        >
          todos
        </button>
        {years.map(year => (
          <div
            key={year}
            className={`yf-year${selectedYear === year ? ' active' : ''}`}
            data-year={year}
            onClick={() => onSelect(year)}
          >
            <div className="yf-planet">
              <div className="yf-ring" />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--coral-dim)' }}>
                {String(year).slice(2)}
              </span>
            </div>
            <div className="yf-year-label">{year}</div>
            <div className="yf-count">{momentCountByYear[year]} momento{momentCountByYear[year] !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
