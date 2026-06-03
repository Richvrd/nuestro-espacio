'use client';

import { useState, useEffect, useCallback } from 'react';
import { COUPLE } from '@/lib/constants';
import { addMovie } from '../actions';
import { TmdbResult, RATINGS, RATING_COLORS, Movie } from '../types';

interface PeliculasSearchOverlayProps {
  existingTmdbIds: Set<number>;
  currentUserName: string;
  onClose: () => void;
  onSaved: (movie: Movie) => void;
}

export function PeliculasSearchOverlay({
  existingTmdbIds, currentUserName, onClose, onSaved,
}: PeliculasSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<TmdbResult | null>(null);
  const [rating, setRating] = useState<Movie['rating']>(null);
  const [watchedAt, setWatchedAt] = useState('');
  const [addedBy, setAddedBy] = useState(currentUserName);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(q)}`);
        const data: { results: TmdbResult[] } = await res.json();
        setResults(data.results || []);
      } catch { setResults([]); }
      setLoading(false);
    }, q.length < 2 ? 0 : 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (r: TmdbResult) => {
    setSelected(r);
    setRating(null);
    setNotes('');
    setWatchedAt('');
    setAddedBy(currentUserName);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await addMovie({
      tmdb_id: selected.tmdb_id,
      title: selected.title,
      year: selected.year,
      poster_url: selected.poster_url,
      overview: selected.overview,
      vote_avg: selected.vote_avg,
      genres: null,
      runtime: null,
      director: null,
      rating,
      notes: notes || null,
      watched_at: watchedAt || null,
      added_by: addedBy,
    });
    setSaving(false);
    if (result.success && result.movie) onSaved(result.movie);
  };

  if (selected) {
    return (
      <div className="pelicula-search-overlay" onClick={onClose}>
        <div className="pelicula-search-panel" onClick={e => e.stopPropagation()}>
          <button className="pelicula-search-back" onClick={() => setSelected(null)}>← volver</button>
          <div className="pelicula-detail-form">
            <div className="pelicula-detail-poster">
              {selected.poster_url ? (
                <img src={selected.poster_url} alt={selected.title} />
              ) : (
                <div className="pelicula-detail-poster-placeholder">🎬</div>
              )}
            </div>
            <div className="pelicula-detail-info">
              <h2 className="pelicula-detail-title">{selected.title}</h2>
              <div className="pelicula-detail-meta">
                {selected.year}{selected.vote_avg ? ` · ⭐ ${selected.vote_avg}` : ''}
              </div>
              {selected.overview && (
                <p className="pelicula-detail-overview">{selected.overview}</p>
              )}

              <div className="pelicula-detail-field">
                <label className="pelicula-detail-label">vuestra calificación</label>
                <div className="rating-pill-row">
                  {RATINGS.map(r => (
                    <button
                      key={r}
                      className={`rating-pill${rating === r ? ' selected' : ''}`}
                      onClick={() => setRating(rating === r ? null : r)}
                      style={rating === r ? {
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
                <label className="pelicula-detail-label">¿cuándo la visteis?</label>
                <input
                  type="date"
                  className="pelicula-detail-input"
                  value={watchedAt}
                  onChange={e => setWatchedAt(e.target.value)}
                />
              </div>

              <div className="pelicula-detail-field">
                <label className="pelicula-detail-label">¿quién la añade?</label>
                <div className="pelicula-addedby-row">
                  {[COUPLE.name1, COUPLE.name2].map(name => (
                    <button
                      key={name}
                      className={`pelicula-addedby-pill${addedBy === name ? ' active' : ''}`}
                      onClick={() => setAddedBy(name)}
                    >{name}</button>
                  ))}
                </div>
              </div>

              <div className="pelicula-detail-field">
                <label className="pelicula-detail-label">notas personales (opcional)</label>
                <textarea
                  className="pelicula-detail-textarea"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="¿Qué os pareció? Una frase, una escena, lo que sea..."
                />
              </div>

              <div className="pelicula-detail-actions">
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>← volver</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'guardando...' : 'guardar película'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pelicula-search-overlay" onClick={onClose}>
      <div className="pelicula-search-panel" onClick={e => e.stopPropagation()}>
        <div className="pelicula-search-header">
          <input
            className="pelicula-search-input"
            type="text"
            placeholder="Busca una película..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button className="pelicula-search-close" onClick={onClose}>×</button>
        </div>
        <div className="pelicula-search-hint">resultados de TMDB</div>

        <div className="pelicula-search-results">
          {query.trim().length < 2 ? (
            <div className="pelicula-search-prompt">
              <span className="pelicula-search-prompt-icon">✦</span>
              <span>Empieza a escribir para buscar</span>
            </div>
          ) : loading ? (
            <div className="pelicula-search-skeletons">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton tmdb-skeleton-row" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="pelicula-search-prompt">
              <span className="pelicula-search-prompt-icon">🔍</span>
              <span>No se encontraron resultados</span>
            </div>
          ) : (
            results.map(r => {
              const alreadyAdded = existingTmdbIds.has(r.tmdb_id);
              return (
                <div
                  key={r.tmdb_id}
                  className={`tmdb-result-item${alreadyAdded ? ' already-added' : ''}`}
                  onClick={() => !alreadyAdded && handleSelect(r)}
                >
                  <div className="tmdb-result-poster">
                    {r.poster_url ? (
                      <img src={r.poster_url} alt={r.title} />
                    ) : (
                      <span>🎬</span>
                    )}
                  </div>
                  <div className="tmdb-result-info">
                    <div className="tmdb-result-title">{r.title}</div>
                    <div className="tmdb-result-meta">{r.year}{r.vote_avg ? ` · ⭐ ${r.vote_avg}` : ''}</div>
                    {r.overview && <div className="tmdb-result-overview">{r.overview}</div>}
                  </div>
                  {alreadyAdded ? (
                    <span className="tmdb-result-badge">ya vista</span>
                  ) : (
                    <span className="tmdb-result-add">+ añadir</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
