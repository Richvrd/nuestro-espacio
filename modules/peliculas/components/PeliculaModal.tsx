'use client';

import { useState, useEffect, useCallback } from 'react';
import { Movie, RATINGS, RATING_COLORS } from '../types';
import { updateMovie, deleteMovie } from '../actions';
import { useRouter } from 'next/navigation';

interface PeliculaModalProps {
  movie: Movie;
  currentUserName: string;
  onClose: () => void;
  onUpdated: (id: string, data: Partial<Movie>) => void;
  onDeleted: (id: string) => void;
}

export function PeliculaModal({ movie, currentUserName, onClose, onUpdated, onDeleted }: PeliculaModalProps) {
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState<Movie['rating']>(movie.rating);
  const [editNotes, setEditNotes] = useState(movie.notes || '');
  const [editWatchedAt, setEditWatchedAt] = useState(movie.watched_at || '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

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

  const handleSave = async () => {
    setSaving(true);
    const result = await updateMovie(movie.id, {
      rating: editRating,
      notes: editNotes || null,
      watched_at: editWatchedAt || null,
    });
    setSaving(false);
    if (result.success) {
      onUpdated(movie.id, { rating: editRating, notes: editNotes || null, watched_at: editWatchedAt || null });
      setEditing(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    onDeleted(movie.id);
    await deleteMovie(movie.id);
    onClose();
    router.refresh();
  };

  const formatDate = (d: string | null) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const canEdit = movie.added_by === currentUserName;

  return (
    <div className="pelicula-search-overlay" onClick={onClose}>
      <div className="pelicula-modal" onClick={e => e.stopPropagation()}>
        <button className="pelicula-search-close" onClick={onClose}>×</button>

        <div className="pelicula-modal-inner">
          <div className="pelicula-modal-poster">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={movie.title} />
            ) : (
              <div className="pelicula-detail-poster-placeholder" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🎬</div>
            )}
          </div>

          <div className="pelicula-modal-details">
            <h2 className="pelicula-modal-title">{movie.title}</h2>
            {movie.year && <div className="pelicula-modal-year">{movie.year}</div>}

            {(movie.director || movie.runtime) && (
              <div className="pelicula-modal-meta">
                {movie.director}{movie.runtime ? ` · ${movie.runtime} min` : ''}
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div className="pelicula-modal-genres">
                {movie.genres.map(g => <span key={g} className="pelicula-genre-tag">{g}</span>)}
              </div>
            )}

            {movie.overview && (
              <p className="pelicula-modal-overview">{movie.overview}</p>
            )}

            {!editing && movie.rating && (
              <div className="pelicula-modal-rating">
                <span
                  className="pelicula-modal-rating-pill"
                  style={{
                    color: RATING_COLORS[movie.rating],
                    borderColor: RATING_COLORS[movie.rating],
                    background: `${RATING_COLORS[movie.rating]}18`,
                    boxShadow: `0 0 20px ${RATING_COLORS[movie.rating]}33`,
                  }}
                >{movie.rating}</span>
                <span className="pelicula-modal-rating-label">vuestra calificación</span>
              </div>
            )}

            {!editing && movie.notes && (
              <div className="pelicula-modal-notes">
                <span className="pelicula-modal-notes-prefix">💬</span>
                {movie.notes}
              </div>
            )}

            {!editing && !movie.notes && (
              <div className="pelicula-modal-notes-empty">sin notas</div>
            )}

            {!editing && movie.watched_at && (
              <div className="pelicula-modal-watched">
                vista el {formatDate(movie.watched_at)}
              </div>
            )}

            {!editing && movie.vote_avg && (
              <div className="pelicula-modal-tmdb">⭐ {movie.vote_avg} en TMDB</div>
            )}

            {/* ── Edit mode ── */}
            {editing && (
              <div className="pelicula-modal-edit">
                <div className="pelicula-detail-field">
                  <label className="pelicula-detail-label">calificación</label>
                  <div className="rating-pill-row">
                    {RATINGS.map(r => (
                      <button
                        key={r}
                        className={`rating-pill${editRating === r ? ' selected' : ''}`}
                        onClick={() => setEditRating(editRating === r ? null : r)}
                        style={editRating === r ? {
                          borderColor: RATING_COLORS[r],
                          color: RATING_COLORS[r],
                          background: `${RATING_COLORS[r]}18`,
                          boxShadow: `0 0 16px ${RATING_COLORS[r]}44`,
                        } : undefined}
                      >{r}</button>
                    ))}
                  </div>
                </div>

                <div className="pelicula-detail-field">
                  <label className="pelicula-detail-label">fecha vista</label>
                  <input
                    type="date"
                    className="pelicula-detail-input"
                    value={editWatchedAt}
                    onChange={e => setEditWatchedAt(e.target.value)}
                  />
                </div>

                <div className="pelicula-detail-field">
                  <label className="pelicula-detail-label">notas</label>
                  <textarea
                    className="pelicula-detail-textarea"
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="¿Qué os pareció?"
                  />
                </div>

                <div className="pelicula-modal-edit-actions">
                  <button className="btn btn-ghost" onClick={() => setEditing(false)}>cancelar</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'guardando...' : 'guardar cambios'}
                  </button>
                </div>
              </div>
            )}

            {!editing && canEdit && (
              <div className="pelicula-modal-actions">
                <button className="cartas-reader-btn" onClick={() => setEditing(true)}>editar</button>
                <button className="cartas-reader-btn cartas-reader-btn--del" onClick={handleDelete}>eliminar</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
