'use client';

import { Toast } from '@/contexts/ToastContext';

const TYPE_CONFIG = {
  success: { color: 'var(--coral)', icon: '✦' },
  error: { color: 'var(--rose)', icon: '✕' },
  warning: { color: 'var(--gold)', icon: '◆' },
} as const;

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const config = TYPE_CONFIG[toast.type];

  return (
    <div className={`toast-item${toast.exiting ? ' exiting' : ''}`}>
      <div className="toast-accent" style={{ background: config.color }} />
      <div className="toast-icon" style={{ background: `${config.color}26`, color: config.color }}>
        {config.icon}
      </div>
      <p className="toast-message">{toast.message}</p>
      <button className="toast-dismiss" onClick={() => onDismiss(toast.id)} aria-label="Cerrar">
        ×
      </button>
      <div
        className="toast-progress"
        style={{ background: config.color, animation: `toastProgress ${toast.duration}ms linear forwards` }}
      />
    </div>
  );
}
