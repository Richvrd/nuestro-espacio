export default function CapsulaLoading() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-subtitle">mensajes del futuro</div>
          <h1 className="page-title">Cápsula del tiempo</h1>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="shimmer" style={{ width: '9rem', height: '2.2rem', borderRadius: '6px' }} />
          <div className="shimmer" style={{ width: '8rem', height: '2.2rem', borderRadius: '6px' }} />
        </div>
      </div>

      <div className="loading-grid" style={{ marginTop: '1rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-card shimmer" />
        ))}
      </div>
    </div>
  );
}
