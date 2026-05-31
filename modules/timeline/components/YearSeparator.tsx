'use client';

export function YearSeparator({ year }: { year: number }) {
  return (
    <div className="year-separator">
      <div className="year-planet-tl">
        <div className="year-planet-core-tl">
          <span>{year}</span>
        </div>
        <div className="year-planet-ring-tl" />
      </div>
    </div>
  );
}
