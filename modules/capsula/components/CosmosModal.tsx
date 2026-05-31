'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getCapsulasEspacio, restoreCapsula } from '../actions';

interface SpaceCapsule {
  id: string;
  subject: string;
  to_name: string;
  open_date: string;
  created_at: string;
}

interface CosmosModalProps {
  onClose: () => void;
  onRestore: () => void;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function CosmosModal({ onClose, onRestore }: CosmosModalProps) {
  const [capsulas, setCapsulas] = useState<SpaceCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    getCapsulasEspacio().then(data => {
      setCapsulas(data);
      setLoading(false);
    });
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const handleRestore = async (id: string) => {
    setRestoring(id);
    await restoreCapsula(id);
    setCapsulas(prev => prev.filter(c => c.id !== id));
    setRestoring(null);
    showToast('✨ cápsula restaurada a tu colección');
    onRestore();
  };

  return (
    <div className="modal-backdrop">
      <div className="write-modal-box cosmos-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">espacio exterior</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cosmos-header-area">
          <div className="cosmos-big-icon">🌌</div>
          <h3>Cápsulas enviadas al espacio</h3>
          <p>
            estas cápsulas viajan por el cosmos. puedes restaurarlas para volver a verlas en tu colección.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <span className="spinner" />
          </div>
        ) : capsulas.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', padding: '2rem' }}>
            no hay cápsulas enviadas al espacio todavía.
          </p>
        ) : (
          <div className="cosmos-list">
            {capsulas.map(cap => (
              <div key={cap.id} className="cosmos-item">
                <div className="cosmos-item-icon">📦</div>
                <div className="cosmos-item-info">
                  <div className="cosmos-item-subject">{cap.subject}</div>
                  <div className="cosmos-item-meta">
                    <span>para · {cap.to_name}</span>
                    <span>creada {fmtDate(cap.created_at)}</span>
                    <span>apertura {fmtDate(cap.open_date)}</span>
                  </div>
                </div>
                <div className="cosmos-item-action">
                  <button className="btn btn-restore" onClick={() => handleRestore(cap.id)}
                    disabled={restoring === cap.id}>
                    {restoring === cap.id ? <span className="spinner" /> : '↩ restaurar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="write-form-divider" />
        <div className="write-form-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onClose}>cerrar</button>
        </div>
      </div>
    </div>
  );
}
