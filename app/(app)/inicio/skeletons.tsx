export function MomentSkeleton() {
  return (
    <div className="inicio-moment-card">
      <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 'var(--radius)', flexShrink: 0 }} />
      <div className="inicio-moment-info" style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: 100, height: 10, borderRadius: 5 }} />
        <div className="skeleton" style={{ width: 160, height: 16, borderRadius: 6, marginTop: 6 }} />
        <div className="skeleton" style={{ width: 70, height: 10, borderRadius: 5, marginTop: 6 }} />
      </div>
    </div>
  );
}

export function GaleriaSkeleton() {
  return (
    <>
      <div className="galeria-stats-row">
        <div className="skeleton" style={{ width: 28, height: 18, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 40, height: 10, borderRadius: 4, marginLeft: 4 }} />
        <span className="stat-divider-vert" style={{ background: 'transparent' }} />
        <div className="skeleton" style={{ width: 28, height: 18, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 70, height: 10, borderRadius: 4, marginLeft: 4 }} />
      </div>
      <div className="inicio-galeria-grid">
        <div className="foto-cell" style={{ gridRow: 'span 2' }}>
          <div className="skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="foto-cell">
          <div className="skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="foto-cell">
          <div className="skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </>
  );
}

export function CartasSkeleton() {
  const items = Array.from({ length: 3 }, (_, i) => (
    <div key={i} className="inicio-letter-item" style={{ cursor: 'default' }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
      <div className="inicio-letter-body">
        <div className="skeleton" style={{ width: 100, height: 10, borderRadius: 5 }} />
        <div className="skeleton" style={{ width: 170, height: 14, borderRadius: 6, marginTop: 4 }} />
      </div>
      <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 5, flexShrink: 0 }} />
    </div>
  ));
  return <div className="inicio-letters-stack">{items}</div>;
}

export function CapsulasSkeleton() {
  const items = Array.from({ length: 2 }, (_, i) => (
    <div key={i} className="inicio-capsule-card" style={{ cursor: 'default' }}>
      <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%', position: 'absolute', top: '0.5rem', right: '0.8rem' }} />
      <div className="skeleton" style={{ width: 120, height: 10, borderRadius: 5 }} />
      <div className="skeleton" style={{ width: 180, height: 14, borderRadius: 6, marginTop: 4 }} />
      <div className="skeleton" style={{ width: 90, height: 10, borderRadius: 5, marginTop: 4 }} />
    </div>
  ));
  return <div className="inicio-capsules-list">{items}</div>;
}
