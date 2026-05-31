'use client';

import { useState, useEffect, useCallback } from 'react';
import { COUPLE } from '@/lib/constants';

interface NuevaCapsulaModalProps {
  onClose: () => void;
  onConfirm: (data: CapsulaFormData) => void;
  saving: boolean;
}

export interface CapsulaFormData {
  toName: string;
  subject: string;
  body: string;
  openDate: string;
  openTime: string;
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function NuevaCapsulaModal({ onClose, onConfirm, saving }: NuevaCapsulaModalProps) {
  const [toName, setToName] = useState<string>(COUPLE.name2);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [openDate, setOpenDate] = useState(tomorrow());
  const [openTime, setOpenTime] = useState('00:00');
  const [error, setError] = useState('');

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

  const handleSubmit = () => {
    if (!subject.trim() || !body.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    const dateTime = new Date(`${openDate}T${openTime}:00`);
    if (dateTime <= new Date()) {
      setError('La fecha de apertura debe estar en el futuro');
      return;
    }
    setError('');
    onConfirm({ toName, subject: subject.trim(), body: body.trim(), openDate, openTime });
  };

  return (
    <div className="modal-backdrop">
      <div className="write-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">nueva cápsula del tiempo</span>
          <button className="modal-close-btn" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="write-form">
          <div className="form-group">
            <label className="form-label">Para</label>
            <select className="form-input" value={toName} onChange={e => setToName(e.target.value)} disabled={saving}>
              <option value={COUPLE.name1}>{COUPLE.name1}</option>
              <option value={COUPLE.name2}>{COUPLE.name2}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Asunto</label>
            <input type="text" className="form-input" value={subject}
              onChange={e => setSubject(e.target.value)} placeholder="Un mensaje para el futuro..."
              disabled={saving} autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Mensaje</label>
            <textarea className="form-input letter-textarea" style={{ minHeight: '160px' }}
              value={body} onChange={e => setBody(e.target.value)}
              placeholder="Escribe aquí el mensaje que se revelará cuando el tiempo llegue..."
              disabled={saving} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha de apertura</label>
              <input type="date" className="form-input" value={openDate}
                onChange={e => setOpenDate(e.target.value)} min={tomorrow()} disabled={saving} />
            </div>
            <div className="form-group">
              <label className="form-label">Hora de apertura</label>
              <input type="time" className="form-input" value={openTime}
                onChange={e => setOpenTime(e.target.value)} disabled={saving} />
              <span className="form-hint">hora local (Chile)</span>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="write-form-divider" />

          <div className="write-form-actions">
            <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Revisar y sellar →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
