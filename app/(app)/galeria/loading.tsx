export default function GaleriaLoading() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-subtitle">nuestros recuerdos</div>
          <h1 className="page-title">Galería</h1>
        </div>
      </div>

      <div className="loading-stats-row">
        <div className="gallery-stat-item">
          <div className="shimmer" style={{ width: '2rem', height: '1.5rem' }} />
          <div className="shimmer" style={{ width: '3rem', height: '0.5rem', marginTop: '0.15rem' }} />
        </div>
        <div className="gallery-stat-sep" />
        <div className="gallery-stat-item">
          <div className="shimmer" style={{ width: '2rem', height: '1.5rem' }} />
          <div className="shimmer" style={{ width: '3.5rem', height: '0.5rem', marginTop: '0.15rem' }} />
        </div>
        <div className="gallery-stat-sep" />
        <div className="gallery-stat-item">
          <div className="shimmer" style={{ width: '2rem', height: '1.5rem' }} />
          <div className="shimmer" style={{ width: '5rem', height: '0.5rem', marginTop: '0.15rem' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="shimmer" style={{ width: '5rem', height: '1.8rem', borderRadius: '6px' }} />
        <div className="shimmer" style={{ width: '8rem', height: '1.8rem', borderRadius: '6px' }} />
        <div className="shimmer" style={{ width: '5rem', height: '1.8rem', borderRadius: '6px' }} />
      </div>

      <div className="loading-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-card shimmer" />
        ))}
      </div>
    </div>
  );
}
