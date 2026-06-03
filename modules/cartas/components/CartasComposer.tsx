'use client';

import { useState, useEffect, useCallback } from 'react';
import { COUPLE } from '@/lib/constants';
import { insertLetter, updateLetter } from '../actions';
import { Letter, MOODS } from '../types';

interface CartasComposerProps {
  onClose: () => void;
  onSaved: (letter?: Letter) => void;
  editLetter?: Letter | null;
  currentUserName: string;
}

export function CartasComposer({ onClose, onSaved, editLetter, currentUserName }: CartasComposerProps) {
  const isEdit = !!editLetter;

  const fromName = isEdit ? editLetter!.from_name : currentUserName;
  const toName = isEdit ? editLetter!.to_name : (
    currentUserName === COUPLE.name1 ? COUPLE.name2 : COUPLE.name1
  );

  const [subject, setSubject] = useState(editLetter?.subject || '');
  const [body, setBody] = useState(editLetter?.body || '');
  const [mood, setMood] = useState<string | null>(editLetter?.mood || null);
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
      const result = await updateLetter(editLetter.id, subject.trim(), body.trim(), mood);
      setLoading(false);
      if (result.success) onSaved(result.letter);
      else onClose();
    } else {
      const result = await insertLetter(fromName, toName, subject.trim(), body.trim(), mood);
      setLoading(false);
      if (result.success) onSaved(result.letter);
      else onClose();
    }
  };

  return (
    <div className="cartas-composer-overlay" onClick={onClose}>
      <div className="cartas-composer" onClick={e => e.stopPropagation()}>
        <div className="cartas-composer-header">
          <span className="cartas-composer-header-title">
            ✍️ {isEdit ? 'editar carta' : 'nueva carta'}
          </span>
          <button className="cartas-composer-close" onClick={onClose}>×</button>
        </div>

        <div className="cartas-composer-fields">
          <div className="cartas-composer-row">
            <div className="cartas-composer-field">
              <label className="cartas-composer-label">de</label>
              <input
                className="cartas-composer-input"
                type="text"
                value={fromName}
                readOnly
              />
            </div>
            <div className="cartas-composer-field">
              <label className="cartas-composer-label">para</label>
              <input
                className="cartas-composer-input"
                type="text"
                value={toName}
                readOnly
              />
            </div>
          </div>

          <div className="cartas-composer-field">
            <label className="cartas-composer-label">asunto</label>
            <input
              className="cartas-composer-input"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Una cosa que quiero decirte..."
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="cartas-composer-field">
            <label className="cartas-composer-label">estado de ánimo</label>
            <div className="composer-mood-row">
              <button
                className={`composer-mood-pill${!mood ? ' active' : ''}`}
                onClick={() => setMood(null)}
                style={!mood ? { borderColor: 'var(--border-hi)', color: 'var(--muted)' } : undefined}
              >
                ninguno
              </button>
              {MOODS.map(m => (
                <button
                  key={m.value}
                  className={`composer-mood-pill${mood === m.value ? ' active' : ''}`}
                  onClick={() => setMood(mood === m.value ? null : m.value)}
                  style={mood === m.value ? {
                    borderColor: m.color,
                    color: m.color,
                    background: `${m.color}18`,
                  } : undefined}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="cartas-composer-field">
            <label className="cartas-composer-label">carta</label>
            <textarea
              className="cartas-composer-textarea"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Escribe lo que sientes..."
              disabled={loading}
            />
            <span className="cartas-composer-charcount">{body.length} caracteres</span>
          </div>
        </div>

        <div className="cartas-composer-divider" />

        <div className="cartas-composer-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !subject.trim() || !body.trim()}>
            {loading ? (
              <span className="btn-loading"><span className="spinner" /> guardando...</span>
            ) : (
              'guardar carta'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
