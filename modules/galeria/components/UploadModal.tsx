'use client';

import { useState, useRef } from 'react';

type Mode = null | 'photo' | 'album';

interface UploadModalProps {
  onClose: () => void;
  onUploadPhoto: (file: File, title: string, caption: string) => Promise<{ success: boolean; error?: string }>;
  onUploadAlbum: (files: File[], title: string, caption: string) => Promise<{ success: boolean; error?: string }>;
}

export function UploadModal({ onClose, onUploadPhoto, onUploadAlbum }: UploadModalProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode(null);
    setTitle('');
    setCaption('');
    setFiles([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (mode === 'photo' && files.length === 1) {
        await onUploadPhoto(files[0], title, caption);
      } else if (mode === 'album' && files.length >= 2) {
        await onUploadAlbum(files, title, caption);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = mode === 'photo'
    ? files.length === 1 && title.trim() !== ''
    : mode === 'album'
    ? files.length >= 2 && title.trim() !== ''
    : false;

  return (
    // Sin onClick en el backdrop — no se cierra al clicar fuera
    <div className="modal-backdrop">
      <div className={`modal-box ${loading ? 'modal-loading' : ''}`}>

        <div className="modal-header">
          <span className="modal-title">
            {mode === null ? 'subir recuerdo' : mode === 'photo' ? 'foto' : 'álbum'}
          </span>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>✕</button>
        </div>

        {mode === null && (
          <div className="upload-type-select">
            <button className="upload-type-btn" onClick={() => setMode('photo')} disabled={loading}>
              <span className="upload-type-icon">📷</span>
              <span className="upload-type-label">foto</span>
              <span className="upload-type-sub">una imagen</span>
            </button>
            <button className="upload-type-btn" onClick={() => setMode('album')} disabled={loading}>
              <span className="upload-type-icon">🗂</span>
              <span className="upload-type-label">álbum</span>
              <span className="upload-type-sub">varias imágenes</span>
            </button>
          </div>
        )}

        {mode !== null && (
          <div className="upload-form">
            <div className="form-field">
              <label className="form-label">título</label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={mode === 'photo' ? 'nombre de la foto' : 'nombre del álbum'}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-field">
              <label className="form-label">descripción</label>
              <input
                className="form-input"
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="opcional — máx. 500 caracteres"
                maxLength={500}
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                {mode === 'photo' ? 'imagen' : `imágenes${files.length > 0 ? ` (${files.length})` : ''}`}
              </label>
              <div
                className={`file-drop-zone ${loading ? 'file-drop-disabled' : ''}`}
                onClick={() => !loading && fileRef.current?.click()}
              >
                {files.length === 0 ? (
                  <span className="file-drop-hint">clic para seleccionar</span>
                ) : mode === 'photo' ? (
                  <div className="file-preview-single">
                    <img src={URL.createObjectURL(files[0])} alt="" />
                    <span>{files[0].name}</span>
                  </div>
                ) : (
                  <div className="file-preview-grid">
                    {files.slice(0, 6).map((f, i) => (
                      <img key={i} src={URL.createObjectURL(f)} alt="" />
                    ))}
                    {files.length > 6 && (
                      <span className="file-preview-more">+{files.length - 6}</span>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple={mode === 'album'}
                style={{ display: 'none' }}
                disabled={loading}
                onChange={e => {
                  const selected = Array.from(e.target.files || []);
                  if (mode === 'photo') setFiles(selected.slice(0, 1));
                  else setFiles(selected.slice(0, 10));
                }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={reset} disabled={loading}>
                ← volver
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    subiendo…
                  </span>
                ) : 'subir'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
