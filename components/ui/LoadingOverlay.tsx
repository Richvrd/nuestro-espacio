'use client';

import { useContext, useEffect, useState, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { LoadingContext } from '@/contexts/LoadingContext';

export function LoadingOverlay() {
  const context = useContext(LoadingContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  if (!mounted || !context || !context.isLoading) return null;

  return createPortal(
    <div className="loading-overlay">
      <div className="loading-orbit">
        <div className="loading-orbit-center" />
        <div className="loading-orbit-ring" />
        <div className="loading-orbit-dot loading-orbit-dot--violet" />
        <div className="loading-orbit-dot loading-orbit-dot--rose" />
      </div>
      <p className="loading-message">{context.loadingMessage}</p>
    </div>,
    document.body
  );
}
