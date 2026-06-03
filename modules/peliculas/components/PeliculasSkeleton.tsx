export function PeliculasSkeleton() {
  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius)' }} />
        ))}
      </div>
    </div>
  );
}
