'use client';

import { useState, useEffect, useCallback } from 'react';
import { COUPLE } from '@/lib/constants';
import { insertLetter, updateLetter } from '../actions';
import { Letter } from '../types';

interface WriteLetterModalProps {
  onClose: () => void;
  onSaved: (letter?: Letter) => void;
  editLetter?: Letter | null;
}

export function WriteLetterModal({ onClose, onSaved, editLetter }: WriteLetterModalProps) {
  const isEdit = !!editLetter;
  const [toName, setToName] = useState<string>(editLetter?.to_name || COUPLE.name2);
  const [subject, setSubject] = useState(editLetter?.subject || '');
  const [body, setBody] = useState(editLetter?.body || '');
  const [loading, setLoading] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) onClose();
  }, [onClose, loading]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim() || loading) return;
    setLoading(true);

    if (isEdit && editLetter) {
      const result = await updateLetter(editLetter.id, subject.trim(), body.trim());
      setLoading(false);
      if (result.success) onSaved(result.letter);
      else onClose();
    } else {
      const fromName = toName === COUPLE.name1 ? COUPLE.name2 : COUPLE.name1;
      const result = await insertLetter(fromName, toName, subject.trim(), body.trim());
      setLoading(false);
      if (result.success) onSaved(result.letter);
      else onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="write-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'editar carta' : 'escribir carta'}</span>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>✕</button>
        </div>

        <div className="write-form">
          <div className="form-group">
            <span className="form-label">De</span>
            <span className="form-value">
              {isEdit
                ? editLetter!.from_name
                : toName === COUPLE.name1 ? COUPLE.name2 : COUPLE.name1}
            </span>
          </div>
          <div className="form-group">
            <label className="form-label">Para</label>
            <select
              className="form-input"
              value={toName}
              onChange={e => setToName(e.target.value)}
              disabled={loading || isEdit}
            >
              <option value={COUPLE.name2}>{COUPLE.name2}</option>
              <option value={COUPLE.name1}>{COUPLE.name1}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Asunto</label>
            <input
              type="text"
              className="form-input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Una cosa que quiero decirte..."
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Carta</label>
            <textarea
              className="form-input letter-textarea"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Escribe tu carta aquí..."
              disabled={loading}
            />
          </div>

          <div className="write-form-divider" />

          <div className="write-form-actions">
            <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : isEdit ? (
                '✦ Guardar cambios'
              ) : (
                '✦ Enviar carta'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
