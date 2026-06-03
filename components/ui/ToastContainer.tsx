'use client';

import { useContext, useEffect, useState, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from '@/contexts/ToastContext';
import { ToastItem } from './ToastItem';

export function ToastContainer() {
  const context = useContext(ToastContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  if (!mounted || !context) return null;

  return createPortal(
    <div className="toast-container">
      {context.toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={context.toast.dismiss} />
      ))}
    </div>,
    document.body
  );
}
