export default function InicioLoading() {
  return (
    <div className="page active">
      <div className="loading-hero">
        <div className="shimmer" style={{ width: '10rem', height: '2.5rem', borderRadius: '6px', marginBottom: '0.5rem' }} />
        <div className="shimmer" style={{ width: '8rem', height: '1rem', borderRadius: '6px', marginBottom: '3rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div className="shimmer" style={{ width: '3rem', height: '4rem', borderRadius: '6px' }} />
          <div className="shimmer" style={{ width: '1rem', height: '2rem', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '3rem', height: '4rem', borderRadius: '6px' }} />
          <div className="shimmer" style={{ width: '1rem', height: '2rem', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '3rem', height: '4rem', borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <div className="shimmer" style={{ width: '2rem', height: '1.5rem', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '0.5rem', height: '1rem', borderRadius: '2px' }} />
          <div className="shimmer" style={{ width: '2rem', height: '1.5rem', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '0.5rem', height: '1rem', borderRadius: '2px' }} />
          <div className="shimmer" style={{ width: '2rem', height: '1.5rem', borderRadius: '4px' }} />
        </div>
        <div className="shimmer" style={{ width: '12rem', height: '0.7rem', borderRadius: '4px', marginTop: '1rem' }} />
      </div>
    </div>
  );
}
