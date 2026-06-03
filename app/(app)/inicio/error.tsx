'use client';

export default function InicioError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="route-error">
      <div className="error-ornament">✦</div>
      <h1 className="error-title" style={{ fontSize: '1.4rem' }}>Algo salió mal cargando el inicio</h1>
      <p className="error-message" style={{ fontSize: '0.85rem' }}>No te preocupes, no perdiste nada.</p>
      <div className="error-sep" />
      <button className="btn btn-primary" onClick={() => reset()}>reintentar</button>
    </div>
  );
}
