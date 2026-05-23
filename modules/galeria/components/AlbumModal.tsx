'use client';

import { useState, useEffect, useCallback } from 'react';
import { Album, Photo } from '../types';

interface AlbumModalProps {
  album: Album;
  onClose: () => void;
  onEditAlbum: (id: string, title: string, caption: string) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<{ success: boolean }>;
  onDeleteAlbum: (id: string) => Promise<{ success: boolean }>;
}

export function AlbumModal({ album, onClose, onEditAlbum, onDeletePhoto, onDeleteAlbum }: AlbumModalProps) {
  const [expanded, setExpanded] = useState<Photo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(album.title);
  const [editCaption, setEditCaption] = useState(album.caption);
  const [loading, setLoading] = useState(false);

  // Sincronizar expanded cuando el álbum cambia (ej: después de borrar una foto)
  useEffect(() => {
    if (expanded) {
      const updated = album.photos.find(p => p.id === expanded.id);
      if (!updated) setExpanded(null); // la foto ya no existe
    }
  }, [album.photos, expanded]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      if (expanded) setExpanded(null);
      else onClose();
    }
  }, [expanded, onClose, loading]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const handleSaveAlbum = async () => {
    setLoading(true);
    await onEditAlbum(album.id, editTitle, editCaption);
    setLoading(false);
    setEditing(false);
  };

  // Elimina la foto expandida actualmente y vuelve al grid
  const handleDeleteExpandedPhoto = async () => {
    if (!expanded) return;
    setLoading(true);
    await onDeletePhoto(expanded.id);
    setLoading(false);
    setExpanded(null);
  };

  const handleDeleteAlbum = async () => {
    setLoading(true);
    await onDeleteAlbum(album.id);
    // onClose lo llama el padre cuando el álbum desaparece del estado
    onClose();
  };

  const formattedDate = new Date(album.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    // Sin onClick en backdrop — no se cierra al clicar fuera
    <div className="modal-backdrop">
      <div className={`album-modal-box ${loading ? 'modal-loading' : ''}`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="album-modal-header">
          {expanded ? (
            <button className="back-btn" onClick={() => setExpanded(null)}>← volver</button>
          ) : (
            <div className="album-modal-meta">
              {editing ? (
                <div className="album-edit-inline">
                  <input
                    className="form-input"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '0.7rem' }} onClick={() => setEditing(false)} disabled={loading}>cancelar</button>
                    <button className="btn btn-primary" style={{ fontSize: '0.7rem' }} onClick={handleSaveAlbum} disabled={loading}>guardar</button>
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
            {/* Tres puntitos: en grid muestra editar + eliminar álbum; en expanded muestra eliminar foto */}
            {!editing && (
              <div className="foto-modal-menu-wrap">
                <button className="three-dots-btn" onClick={() => setMenuOpen(o => !o)} disabled={loading}>···</button>
                {menuOpen && (
                  <div className="three-dots-menu--below">
                    {expanded ? (
                      // Vista foto expandida → solo eliminar esa foto
                      <button className="delete-opt" onClick={() => { setMenuOpen(false); handleDeleteExpandedPhoto(); }}>
                        eliminar foto
                      </button>
                    ) : (
                      // Vista grid → editar o eliminar álbum completo
                      <>
                        <button onClick={() => { setEditing(true); setMenuOpen(false); }}>editar</button>
                        <button className="delete-opt" onClick={() => { setMenuOpen(false); handleDeleteAlbum(); }}>
                          eliminar álbum
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            <button className="modal-close-btn" onClick={onClose} disabled={loading}>✕</button>
          </div>
        </div>

        {/* Contenido */}
        {expanded ? (
          <div className="album-expanded-view">
            <img src={expanded.url || ''} alt="" className="album-expanded-img" />
          </div>
        ) : (
          <div className="album-photos-grid">
            {album.photos.map((photo) => (
              <div
                key={photo.id}
                className="album-photo-item"
                onClick={() => setExpanded(photo)}
              >
                {photo.url
                  ? <img src={photo.url} alt="" />
                  : <div className="album-photo-placeholder">{photo.emoji || '📷'}</div>
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
