'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StarField } from '@/components/shared/StarField';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const isTechnical = !error.message ||
    /error:|undefined|null|cannot|failed|unexpected|chunk/i.test(error.message);
  const displayMessage = isTechnical
    ? 'Ocurrió un error inesperado. No te preocupes, no perdiste nada.'
    : error.message;

  return (
    <div className="error-page">
      <StarField />
      <div className="error-ornament error-stagger" style={{ animationDelay: '0s' }}>✦</div>
      <div className="error-eyebrow error-stagger" style={{ animationDelay: '0.1s' }}>ups...</div>
      <h1 className="error-title error-stagger" style={{ animationDelay: '0.2s' }}>Algo salió mal</h1>
      <p className="error-message error-stagger" style={{ animationDelay: '0.3s' }}>{displayMessage}</p>
      <div className="error-sep error-stagger" style={{ animationDelay: '0.4s' }} />
      <div className="error-actions error-stagger" style={{ animationDelay: '0.5s' }}>
        <button className="btn btn-primary" onClick={() => router.push('/inicio')}>volver al inicio</button>
        <button className="btn btn-ghost" onClick={() => reset()}>intentar de nuevo</button>
      </div>
    </div>
  );
}
