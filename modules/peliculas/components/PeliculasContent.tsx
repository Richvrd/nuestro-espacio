'use client';

import { useRef, useState } from 'react';
import { Movie, RATING_COLORS } from '../types';

interface PeliculasContentProps {
  movies: Movie[];
  view: 'grid' | 'list';
  onSelect: (m: Movie) => void;
  onClearFilters: () => void;
}

function RatingBadge({ rating }: { rating: string | null }) {
  if (!rating) return null;
  return (
    <span
      className="pelicula-rating-badge"
      style={{ background: `${RATING_COLORS[rating]}22`, color: RATING_COLORS[rating] }}
    >
      {rating}
    </span>
  );
}

function UnratedDot() {
  return <span className="pelicula-unrated-dot" />;
}

function MoviePoster({ movie }: { movie: Movie }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [broken, setBroken] = useState(false);

  if (!movie.poster_url || broken) {
    return (
      <div className="pelicula-poster-placeholder">
        <span style={{ fontSize: '1.6rem' }}>🎬</span>
        <span className="pelicula-poster-placeholder-title">{movie.title}</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={movie.poster_url}
      alt={movie.title}
      onError={() => setBroken(true)}
    />
  );
}

export function PeliculasContent({ movies, view, onSelect, onClearFilters }: PeliculasContentProps) {
  const formatDate = (d: string | null) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (movies.length === 0) {
    return (
      <div className="peliculas-empty">
        <span className="peliculas-empty-icon">🔍</span>
        <span className="peliculas-empty-text">Ninguna película coincide con los filtros</span>
        <button className="btn btn-ghost btn-sm" onClick={onClearFilters}>Limpiar filtros</button>
      </div>
    );
  }

  if (view === 'grid') {
    return (
      <div className="peliculas-grid">
        {movies.map(m => (
          <div key={m.id} className="pelicula-card" onClick={() => onSelect(m)}>
            <MoviePoster movie={m} />
            <RatingBadge rating={m.rating} />
            {!m.rating && <UnratedDot />}
            <div className="pelicula-card-overlay">
              <div className="pelicula-card-overlay-title">{m.title}</div>
              <div className="pelicula-card-overlay-meta">
                {m.year}{m.director ? ` · ${m.director}` : ''}
              </div>
              {m.genres && m.genres.length > 0 && (
                <div className="pelicula-card-overlay-genres">
                  {m.genres.slice(0, 3).map(g => (
                    <span key={g} className="pelicula-genre-tag">{g}</span>
                  ))}
                </div>
              )}
              {m.notes && <div className="pelicula-card-overlay-notes">{m.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="peliculas-list">
      {movies.map(m => (
        <div key={m.id} className="pelicula-list-item" onClick={() => onSelect(m)}>
          <div className="pelicula-list-thumb">
            {m.poster_url ? (
              <img src={m.poster_url} alt={m.title} className="pelicula-list-img" />
            ) : (
              <div className="pelicula-list-placeholder">🎬</div>
            )}
          </div>
          <div className="pelicula-list-info">
            <div className="pelicula-list-title">{m.title}</div>
            <div className="pelicula-list-meta">
              {m.year}{m.director ? ` · ${m.director}` : ''}
            </div>
            {m.genres && m.genres.length > 0 && (
              <div className="pelicula-list-genres">
                {m.genres.slice(0, 3).map(g => (
                  <span key={g} className="pelicula-genre-tag">{g}</span>
                ))}
              </div>
            )}
            {m.notes && <div className="pelicula-list-notes">{m.notes}</div>}
          </div>
          <div className="pelicula-list-right">
            {m.rating && (
              <span
                className="pelicula-rating-badge"
                style={{ background: `${RATING_COLORS[m.rating]}22`, color: RATING_COLORS[m.rating], position: 'relative', top: 'auto', right: 'auto' }}
              >{m.rating}</span>
            )}
            {m.watched_at && (
              <div className="pelicula-list-date">{formatDate(m.watched_at)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
