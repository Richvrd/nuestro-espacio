'use client';

import { useState, useEffect, useCallback } from 'react';
import { Album, Photo } from '../types';

interface AlbumModalProps {
  album: Album;
  onClose: () => void;
  onEditAlbum: (id: string, title: string, caption: string) => Promise<void>;
  onDeletePhotos: (ids: string[]) => Promise<void>;
  onDeleteAlbum: (id: string) => Promise<void>;
}

export function AlbumModal({ album, onClose, onEditAlbum, onDeletePhotos, onDeleteAlbum }: AlbumModalProps) {
  const [expanded, setExpanded] = useState<Photo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(album.title);
  const [editCaption, setEditCaption] = useState(album.caption);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (expanded) setExpanded(null);
      else onClose();
    }
  }, [expanded, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const handleSaveAlbum = async () => {
    await onEditAlbum(album.id, editTitle, editCaption);
    setEditing(false);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    await onDeletePhotos(Array.from(selected));
    if (selected.size >= album.photos.length) {
      onClose();
    } else {
      setDeleting(false);
      setSelected(new Set());
    }
  };

  const handleDeleteAlbum = async () => {
    await onDeleteAlbum(album.id);
    onClose();
  };

  const formattedDate = new Date(album.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="album-modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="album-modal-header">
          {expanded ? (
            <button className="back-btn" onClick={() => setExpanded(null)}>← volver</button>
          ) : (
            <div className="album-modal-meta">
              {editing ? (
                <div className="album-edit-inline">
                  <input className="form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus />
                  <input className="form-input" value={editCaption} onChange={e => setEditCaption(e.target.value)} placeholder="descripción" />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '0.7rem' }} onClick={() => setEditing(false)}>cancelar</button>
                    <button className="btn btn-primary" style={{ fontSize: '0.7rem' }} onClick={handleSaveAlbum}>guardar</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="album-modal-title">{album.title}</h2>
                  {album.caption && <p className="album-modal-caption">{album.caption}</p>}
                  <span className="foto-modal-date">{formattedDate} · {album.photos.length} fotos</span>
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {!expanded && !editing && (
              <div className="foto-modal-menu-wrap">
                <button className="three-dots-btn" onClick={() => setMenuOpen(o => !o)}>···</button>
                {menuOpen && (
                  <div className="three-dots-menu">
                    <button onClick={() => { setEditing(true); setMenuOpen(false); }}>editar</button>
                    <button onClick={() => { setDeleting(true); setMenuOpen(false); }}>eliminar fotos</button>
                    <button className="delete-opt" onClick={handleDeleteAlbum}>eliminar álbum</button>
                  </div>
                )}
              </div>
            )}
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Barra de selección para borrar */}
        {deleting && !expanded && (
          <div className="delete-bar">
            <span className="form-label">{selected.size} seleccionada{selected.size !== 1 ? 's' : ''}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-ghost" style={{ fontSize: '0.7rem' }} onClick={() => { setDeleting(false); setSelected(new Set()); }}>cancelar</button>
              <button className="btn btn-primary" style={{ fontSize: '0.7rem' }} disabled={selected.size === 0} onClick={handleDeleteSelected}>eliminar</button>
            </div>
          </div>
        )}

        {/* Contenido */}
        {expanded ? (
          <div className="album-expanded-view">
            <img src={expanded.url || ''} alt={expanded.title} className="album-expanded-img" />
            <div className="album-expanded-info">
              <p className="foto-modal-title">{expanded.title}</p>
              {expanded.caption && <p className="foto-modal-caption">{expanded.caption}</p>}
            </div>
          </div>
        ) : (
          <div className="album-photos-grid">
            {album.photos.map((photo) => (
              <div
                key={photo.id}
                className={`album-photo-item ${deleting && selected.has(photo.id) ? 'selected' : ''}`}
                onClick={() => deleting ? toggleSelect(photo.id) : setExpanded(photo)}
              >
                {photo.url
                  ? <img src={photo.url} alt={photo.title} />
                  : <div className="album-photo-placeholder">{photo.emoji || '📷'}</div>
                }
                {deleting && (
                  <div className="album-select-check">{selected.has(photo.id) ? '✓' : ''}</div>
                )}
                <div className="album-photo-caption">{photo.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
