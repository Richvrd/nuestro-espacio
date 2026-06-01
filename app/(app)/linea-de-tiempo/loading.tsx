export default function LineaDeTiempoLoading() {
  return (
    <div className="page active">
      <div className="loading-timeline">
        <div className="shimmer" style={{ width: '16rem', height: '2rem', borderRadius: '6px' }} />
        <div className="shimmer" style={{ width: '20rem', height: '0.7rem', borderRadius: '4px' }} />

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', width: '100%', maxWidth: '500px', justifyContent: 'center' }}>
          <div className="shimmer" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
          <div className="shimmer" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
          <div className="shimmer" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
          <div className="shimmer" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
        </div>

        <div className="loading-timeline-axis">
          <div className="loading-tl-item">
            <div className="shimmer" />
            <div className="loading-tl-dot-wrap"><div className="skeleton-tl-dot" /></div>
            <div />
          </div>
          <div className="loading-tl-item">
            <div />
            <div className="loading-tl-dot-wrap"><div className="skeleton-tl-dot" /></div>
            <div className="shimmer" />
          </div>
          <div className="loading-tl-item">
            <div className="shimmer" />
            <div className="loading-tl-dot-wrap"><div className="skeleton-tl-dot" /></div>
            <div />
          </div>
          <div className="loading-tl-item">
            <div />
            <div className="loading-tl-dot-wrap"><div className="skeleton-tl-dot" /></div>
            <div className="shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
