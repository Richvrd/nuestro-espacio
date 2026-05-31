'use client';

import { useEffect, useCallback } from 'react';
import type { CapsulaFormData } from './NuevaCapsulaModal';

interface ConfirmModalProps {
  data: CapsulaFormData;
  onBack: () => void;
  onConfirm: () => void;
  saving: boolean;
}

function simulateEncrypted(text: string): string {
  try {
    const preview = text.slice(0, 20);
    return btoa(preview) + '...';
  } catch {
    return '[no se puede previsualizar]';
  }
}

export function ConfirmModal({ data, onBack, onConfirm, saving }: ConfirmModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !saving) onBack();
  }, [onBack, saving]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const dateStr = new Date(`${data.openDate}T${data.openTime}:00`).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="modal-backdrop">
      <div className="write-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">revisar y sellar</span>
          <button className="modal-close-btn" onClick={onBack} disabled={saving}>✕</button>
        </div>

        <div className="confirm-box">
          <p>Antes de guardar, revisa los detalles de tu cápsula:</p>
          <div className="confirm-detail">
            <div className="confirm-row">
              <span className="confirm-key">Para</span>
              <span className="confirm-val">{data.toName}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-key">Asunto</span>
              <span className="confirm-val">{data.subject}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-key">Apertura</span>
              <span className="confirm-val">{dateStr} a las {data.openTime}</span>
            </div>
            <div className="confirm-row" style={{ alignItems: 'flex-start' }}>
              <span className="confirm-key">Mensaje cifrado</span>
              <span className="confirm-val encrypted">{simulateEncrypted(data.body)}</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          el mensaje se guarda encriptado con AES-256. nadie puede leerlo en la base de datos.
          solo se descifra cuando llegue la fecha y hora de apertura. 🔐
        </p>

        <div className="write-form-actions">
          <button className="btn btn-ghost" onClick={onBack} disabled={saving}>← volver</button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Sellar cápsula 🔒'}
          </button>
        </div>
      </div>
    </div>
  );
}
