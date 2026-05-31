'use client';

import { useEffect, useCallback } from 'react';

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({ onConfirm, onClose }: DeleteConfirmModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">¿Eliminar este momento?</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: '1rem 1.5rem 1.5rem' }}>
          <p style={{ fontFamily: 'var(--body)', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
            esta acción no se puede deshacer
          </p>
          <p style={{ fontFamily: 'var(--body)', fontSize: '0.75rem', color: 'var(--dimmed)', marginBottom: '1.5rem' }}>
            este momento desaparecerá de la línea de tiempo para siempre. los momentos vividos merecen ser recordados — ¿estás seguro/a?
          </p>
          <div className="write-form-actions">
            <button className="btn btn-ghost" onClick={onClose}>cancelar</button>
            <button className="btn btn-danger" onClick={onConfirm}>sí, eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
