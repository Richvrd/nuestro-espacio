'use client';

import { useState, useEffect, useCallback } from 'react';
import { Photo } from '../types';

interface FotoModalProps {
  photo: Photo;
  onClose: () => void;
  onEdit: (id: string, title: string, caption: string) => Promise<{ success: boolean }>;
  onDelete: (id: string) => Promise<{ success: boolean }>;
}

export function FotoModal({ photo, onClose, onEdit, onDelete }: FotoModalProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(photo.title || photo.caption);
  const [editCaption, setEditCaption] = useState(photo.caption);
  const [loading, setLoading] = useState(false);

  // Sincronizar inputs si la foto cambia externamente
  useEffect(() => {
    if (!editing) {
      setEditTitle(photo.title || photo.caption);
      setEditCaption(photo.caption);
    }
  }, [photo.title, photo.caption, editing]);

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

  const handleSave = async () => {
    setLoading(true);
    await onEdit(photo.id, editTitle, editCaption);
    setLoading(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete(photo.id);
    // onClose lo llama el padre al filtrar la foto del estado
    onClose();
  };

  // Solo cerrar al clicar backdrop si no hay acción en curso
  const handleBackdrop = () => { if (!loading) onClose(); };

  const formattedDate = new Date(photo.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className={`foto-modal-box ${loading ? 'modal-loading' : ''}`} onClick={e => e.stopPropagation()}>

        <div className="foto-modal-img-wrap">
          {photo.url
            ? <img src={photo.url} alt={photo.title} className="foto-modal-img" />
            : <div className="foto-modal-placeholder" style={{ background: photo.bg_gradient || 'linear-gradient(135deg,#2a1f35,#1a1924)' }}>{photo.emoji || '📷'}</div>
          }
        </div>

        <div className="foto-modal-sidebar">
          <div className="foto-modal-sidebar-top">
            <button className="modal-close-btn" onClick={onClose} disabled={loading}>✕</button>
          </div>

          {editing ? (
            <div className="foto-modal-edit">
              <input
                className="form-input"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="título"
                disabled={loading}
                autoFocus
              />
              <input
                className="form-input"
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                placeholder="descripción"
                disabled={loading}
              />
              <div className="modal-actions" style={{ marginTop: 'auto' }}>
                <button className="btn btn-ghost" onClick={() => setEditing(false)} disabled={loading}>
                  cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? <span className="spinner" /> : 'guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="foto-modal-info">
              {/* Muestra título/caption reactivos desde la prop photo */}
              <h2 className="foto-modal-title">{photo.title || photo.caption}</h2>
              {photo.caption && photo.caption !== (photo.title || photo.caption) && (
                <p className="foto-modal-caption">{photo.caption}</p>
              )}
              <span className="foto-modal-date">{formattedDate}</span>

              <div className="foto-modal-menu-wrap">
                <button className="three-dots-btn" onClick={() => setMenuOpen(o => !o)} disabled={loading}>
                  ···
                </button>
                {menuOpen && (
                  <div className="three-dots-menu">
                    <button onClick={() => { setEditing(true); setMenuOpen(false); }}>editar</button>
                    <button className="delete-opt" onClick={handleDelete}>eliminar</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
