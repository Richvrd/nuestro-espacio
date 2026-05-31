'use client';

import { useState, useEffect, useCallback } from 'react';
import { Capsule } from '../types';

interface ReaderModalProps {
  capsule: Capsule;
  onClose: () => void;
  onSendToSpace: (id: string) => void;
  saving: boolean;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function ReaderModal({ capsule, onClose, onSendToSpace, saving }: ReaderModalProps) {
  const [sent, setSent] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !saving) onClose();
  }, [onClose, saving]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const handleSend = () => {
    setSent(true);
    onSendToSpace(capsule.id);
  };

  if (sent) return null;

  return (
    <div className="modal-backdrop">
      <div className="letter-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">cápsula abierta</span>
          <button className="modal-close-btn" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="capsule-reader-badge">cápsula abierta</div>
        <h2 className="capsule-reader-subject">{capsule.subject}</h2>
        <div className="capsule-reader-meta">para · {capsule.to_name}</div>

        <div className="capsule-reader-body">{capsule.decryptedBody}</div>

        <div className="capsule-reader-date">
          escrita el {fmtDate(capsule.created_at)} · abierta el {fmtDate(capsule.open_date)}
        </div>

        <div className="write-form-divider" style={{ marginTop: '1.5rem' }} />

        <div className="write-form-actions">
          <button className="btn btn-send-space" onClick={handleSend} disabled={saving}>
            🚀 enviar al espacio
          </button>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>cerrar</button>
        </div>
      </div>
    </div>
  );
}
