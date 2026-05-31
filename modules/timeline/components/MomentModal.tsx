'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Moment, MomentIntensity, MomentCategory } from '../types';
import { CATEGORY_META, INTENSITY_META } from '../types';

interface MomentFormPayload {
  title: string;
  description: string;
  private_note: string;
  date: string;
  intensity: MomentIntensity;
  category: MomentCategory;
  emoji: string;
}

interface MomentModalProps {
  mode: 'create' | 'edit';
  editMoment?: Moment;
  prevDate?: string | null;
  nextDate?: string | null;
  onClose: () => void;
  onSave: (payload: MomentFormPayload) => Promise<void>;
  saving: boolean;
}

const EMOJI_OPTIONS = ['🌟', '💫', '🌙', '☀️', '🌸', '🌊', '🔥', '🍃', '🎵', '✨'];

function formatDateHuman(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function MomentModal({ mode, editMoment, prevDate, nextDate, onClose, onSave, saving }: MomentModalProps) {
  const [intensity, setIntensity] = useState<MomentIntensity>(editMoment?.intensity || 'normal');
  const [emoji, setEmoji] = useState(editMoment?.emoji || '🌟');
  const [category, setCategory] = useState<MomentCategory>(editMoment?.category || 'cotidiano');
  const [title, setTitle] = useState(editMoment?.title || '');
  const [date, setDate] = useState(editMoment?.date || '');
  const [description, setDescription] = useState(editMoment?.description || '');
  const [privateNote, setPrivateNote] = useState(editMoment?.private_note || '');

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

  const handleSubmit = async () => {
    if (!title.trim() || !date || saving) return;
    await onSave({ title: title.trim(), description, private_note: privateNote, date, intensity, category, emoji });
  };

  const hasDateConstraint = mode === 'create' && (prevDate || nextDate);

  return (
    <div className="modal-backdrop">
      <div className="write-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{mode === 'create' ? 'nuevo momento' : 'editar momento'}</span>
          <button className="modal-close-btn" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="write-form">
          {/* Date range hint */}
          {hasDateConstraint && (
            <div className="date-range-hint">
              📅 fecha{prevDate ? ` entre ${formatDateHuman(prevDate)}` : ''}
              {prevDate && nextDate ? ' y ' : ''}
              {nextDate ? `hasta ${formatDateHuman(nextDate)}` : ''}
              {prevDate && !nextDate ? ' en adelante' : ''}
              {nextDate && !prevDate ? ' hacia atrás' : ''}
            </div>
          )}

          {/* Intensity picker */}
          <div className="form-label">intensidad</div>
          <div className="intensity-picker" style={{ marginBottom: '1.2rem' }}>
            {(Object.entries(INTENSITY_META) as [MomentIntensity, typeof INTENSITY_META['normal']][]).map(([key, meta]) => (
              <div
                key={key}
                className={`ip-option ${key}${intensity === key ? ' selected' : ''}`}
                onClick={() => setIntensity(key)}
              >
                <span className="ip-icon">
                  {key === 'normal' ? '☁️' : key === 'high' ? '⭐' : '✦'}
                </span>
                <span className="ip-label">{key === 'normal' ? 'normal' : key === 'high' ? 'especial' : 'muy especial'}</span>
              </div>
            ))}
          </div>

          {/* Emoji + Category row */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ flex: 1 }}>
              <div className="form-label">emoji</div>
              <div className="emoji-grid" style={{ marginTop: '0.4rem' }}>
                {EMOJI_OPTIONS.map(e => (
                  <div
                    key={e}
                    className={`emoji-opt${emoji === e ? ' active' : ''}`}
                    onClick={() => setEmoji(e)}
                  >
                    {e}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="form-label">categoría</div>
              <select
                className="form-input"
                value={category}
                onChange={e => setCategory(e.target.value as MomentCategory)}
                disabled={saving}
                style={{ marginTop: '0.4rem' }}
              >
                {(Object.entries(CATEGORY_META) as [MomentCategory, typeof CATEGORY_META['primer-vez']][]).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">título</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="¿qué pasó?"
              disabled={saving}
              autoFocus={mode === 'create'}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">fecha</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={saving}
              min={mode === 'create' && prevDate ? prevDate : undefined}
              max={mode === 'create' && nextDate ? nextDate : undefined}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">¿qué pasó?</label>
            <textarea
              className="form-input letter-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="describe este momento..."
              disabled={saving}
              style={{ minHeight: '100px' }}
            />
          </div>

          {/* Private note */}
          <div className="form-group">
            <label className="form-label">nota privada <span style={{ color: 'var(--dimmed)', fontSize: '0.55rem' }}>(solo visible en vista expandida)</span></label>
            <input
              type="text"
              className="form-input"
              value={privateNote}
              onChange={e => setPrivateNote(e.target.value)}
              placeholder="un detalle solo para nosotros..."
              disabled={saving}
            />
          </div>

          <div className="write-form-divider" />

          <div className="write-form-actions">
            <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
              cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !title.trim() || !date}>
              {saving ? (
                <span className="spinner" />
              ) : mode === 'create' ? (
                'guardar momento ✦'
              ) : (
                'guardar cambios ✦'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
