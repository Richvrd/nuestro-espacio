export default function PeliculasPage() {
  return (
    <div className="page active">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: '1.2rem',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #2a2535, #0f0e18 50%, #0a0912)',
          border: '2px solid var(--border-hi)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          boxShadow: '0 0 40px rgba(201,169,110,0.05), inset 0 0 60px rgba(0,0,0,0.6)',
        }}>
          🎬
        </div>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: '2rem',
          fontWeight: 400,
          color: 'var(--text)',
        }}>
          Películas
        </h1>
        <p style={{
          fontFamily: 'var(--body)',
          fontSize: '0.95rem',
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'var(--muted)',
          lineHeight: 1.6,
          maxWidth: 400,
        }}>
          Las historias que vemos juntos también son parte de la nuestra.
        </p>
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          marginTop: '0.5rem',
        }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--gold-dim)', opacity: 0.5 }}>🎞️</span>
          <span style={{ fontSize: '1.2rem', color: 'var(--gold)', opacity: 0.5 }}>🎥</span>
          <span style={{ fontSize: '1.2rem', color: 'var(--rose)', opacity: 0.5 }}>🍿</span>
        </div>
      </div>
    </div>
  );
}
