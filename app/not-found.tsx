'use client';

import { useRouter } from 'next/navigation';
import { StarField } from '@/components/shared/StarField';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="error-page">
      <StarField />
      <div className="error-ornament error-stagger" style={{ animationDelay: '0s' }}>✦</div>
      <div className="error-eyebrow error-stagger" style={{ animationDelay: '0.1s' }}>404</div>
      <h1 className="error-title error-stagger" style={{ animationDelay: '0.2s' }}>esta página no existe</h1>
      <p className="error-message error-stagger" style={{ animationDelay: '0.3s' }}>El rincón que buscas no está aquí. Quizás nunca existió, o quizás ya no está.</p>
      <div className="error-sep error-stagger" style={{ animationDelay: '0.4s' }} />
      <div className="error-actions error-stagger" style={{ animationDelay: '0.5s' }}>
        <button className="btn btn-primary" onClick={() => router.push('/inicio')}>volver al inicio</button>
      </div>
    </div>
  );
}
