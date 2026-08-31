'use client';

import { useMemo, useState } from 'react';
import { Movie, RATINGS, RATING_COLORS } from '../types';
import { PeliculasContent } from './PeliculasContent';
import { PeliculasSearchOverlay } from './PeliculasSearchOverlay';
import { PeliculaModal } from './PeliculaModal';

interface PeliculasAppProps {
  initialMovies: Movie[];
  currentUserName: string;
}

function sortValue(rating: string | null): number {
  if (!rating) return 99;
  const idx = RATINGS.indexOf(rating as any);
  return idx >= 0 ? idx : 99;
}

export function PeliculasApp({ initialMovies, currentUserName }: PeliculasAppProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [ratingFilter, setRatingFilter] = useState<Set<string>>(new Set());
  const [genreFilter, setGenreFilter] = useState('');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState<'grid' | 'list'>(
    typeof window !== 'undefined'
      ? (localStorage.getItem('peliculas-view') as 'grid' | 'list') || 'grid'
      : 'grid'
  );
  const [showStats, setShowStats] = useState(false);

  const allGenres = useMemo(() => {
    const g = new Set<string>();
    movies.forEach(m => m.genres?.forEach(genre => g.add(genre)));
    return Array.from(g).sort();
  }, [movies]);

  const filtered = useMemo(() => {
    let result = [...movies];

    if (ratingFilter.size > 0) {
      result = result.filter(m => m.rating && ratingFilter.has(m.rating));
    }

    if (genreFilter) {
      result = result.filter(m => m.genres?.includes(genreFilter));
    }

    switch (sort) {
      case 'rating':
        result.sort((a, b) => sortValue(a.rating) - sortValue(b.rating));
        break;
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'year':
        result.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
        break;
      default:
        break;
    }

    return result;
  }, [movies, ratingFilter, genreFilter, sort]);

  const toggleRating = (r: string) => {
    setRatingFilter(prev => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };

  const handleView = (v: 'grid' | 'list') => {
    setView(v);
    if (typeof window !== 'undefined') localStorage.setItem('peliculas-view', v);
  };

  const handleSaved = (movie: Movie) => {
    setShowSearch(false);
    setMovies(prev => [movie, ...prev]);
    setSelectedMovie(movie);
  };

  const handleUpdated = (id: string, data: Partial<Movie>) => {
    setMovies(prev => prev.map(m => m.id === id ? { ...m, ...data } as Movie : m));
    setSelectedMovie(prev => prev && prev.id === id ? { ...prev, ...data } as Movie : prev);
  };

  const handleDeleted = (id: string) => {
    setMovies(prev => prev.filter(m => m.id !== id));
    setSelectedMovie(null);
  };

  const sssCount = movies.filter(m => m.rating === 'SSS').length;
  const sCount = movies.filter(m => m.rating === 'S').length;
  const unratedCount = movies.filter(m => !m.rating).length;
  const bestRated = movies
    .filter(m => m.rating === 'SSS')
    .sort((a, b) => sortValue(a.rating) - sortValue(b.rating));
  const topGenre = useMemo(() => {
    const freq: Record<string, number> = {};
    movies.forEach(m => m.genres?.forEach(g => { freq[g] = (freq[g] || 0) + 1; }));
    let max = 0, top = '';
    for (const [g, c] of Object.entries(freq)) {
      if (c > max) { max = c; top = g; }
    }
    return top;
  }, [movies]);
  const lastWatched = movies
    .filter(m => m.watched_at)
    .sort((a, b) => (b.watched_at || '').localeCompare(a.watched_at || ''))[0] || null;

  const avgRating = useMemo(() => {
    const rated = movies.filter(m => m.rating);
    if (rated.length === 0) return '—';
    const total = rated.reduce((sum, m) => sum + sortValue(m.rating), 0);
    const avg = total / rated.length;
    if (avg <= 0.5) return 'SSS';
    if (avg <= 1.5) return 'S';
    if (avg <= 2.5) return 'A';
    if (avg <= 3.5) return 'B';
    if (avg <= 4.5) return 'C';
    if (avg <= 5.5) return 'D';
    return 'F';
  }, [movies]);

  return (
    <div className="peliculas-page">
      {/* ── Header ── */}
      <div className="peliculas-header">
        <div>
          <div className="peliculas-subtitle">lo que hemos visto juntos</div>
          <h1 className="peliculas-title">nuestras <em>películas</em></h1>
        </div>
        <div className="peliculas-header-right">
          <div className="peliculas-stats-row">
            <div className="peliculas-stat-pill">
              <span className="peliculas-stat-val">{movies.length}</span>
              <span className="peliculas-stat-label">películas</span>
            </div>
            <div className="peliculas-stat-pill">
              <span className="peliculas-stat-val" style={{ color: 'var(--coral)' }}>
                {sssCount + sCount}
              </span>
              <span className="peliculas-stat-label">favoritas</span>
            </div>
            <div className="peliculas-stat-pill">
              <span className="peliculas-stat-val" style={{ color: 'var(--coral)' }}>
                {avgRating}
              </span>
              <span className="peliculas-stat-label">media</span>
            </div>
          </div>
          <div className="view-toggle">
            <button className={`vt-btn${view === 'grid' ? ' active' : ''}`} onClick={() => handleView('grid')}>▦</button>
            <button className={`vt-btn${view === 'list' ? ' active' : ''}`} onClick={() => handleView('list')}>☰</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSearch(true)}>+ añadir película</button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="peliculas-filters">
        <div className="peliculas-filter-chips">
          <button
            className={`peliculas-chip${ratingFilter.size === 0 ? ' active' : ''}`}
            onClick={() => setRatingFilter(new Set())}
          >Todas</button>
          {RATINGS.map(r => (
            <button
              key={r}
              className={`peliculas-chip${ratingFilter.has(r) ? ' active' : ''}`}
              onClick={() => toggleRating(r)}
              style={ratingFilter.has(r) ? {
                borderColor: RATING_COLORS[r],
                color: RATING_COLORS[r],
                background: `${RATING_COLORS[r]}18`,
              } : undefined}
            >{r}</button>
          ))}
        </div>
        <select
          className="peliculas-select"
          value={genreFilter}
          onChange={e => setGenreFilter(e.target.value)}
        >
          <option value="">Todos los géneros</option>
          {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          className="peliculas-select"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="recent">Más recientes</option>
          <option value="rating">Mejor calificadas</option>
          <option value="alpha">A–Z</option>
          <option value="year">Año</option>
        </select>
      </div>

      {/* ── Stats toggle ── */}
      <button className="peliculas-stats-toggle" onClick={() => setShowStats(s => !s)}>
        {showStats ? '▴' : '▾'} ver estadísticas
      </button>

      {showStats && (
        <div className="peliculas-stat-panel">
          <div className="peliculas-stat-card">
            <span className="peliculas-stat-card-val">{movies.length}</span>
            <span className="peliculas-stat-card-label">Total películas</span>
          </div>
          <div className="peliculas-stat-card">
            <span className="peliculas-stat-card-val" style={{ color: 'var(--coral)' }}>
              {bestRated.length > 0 ? bestRated[0].title : '—'}
            </span>
            <span className="peliculas-stat-card-label">Mejor calificada</span>
          </div>
          <div className="peliculas-stat-card">
            <span className="peliculas-stat-card-val">{topGenre || '—'}</span>
            <span className="peliculas-stat-card-label">Género más visto</span>
          </div>
          <div className="peliculas-stat-card">
            <span className="peliculas-stat-card-val" style={{ color: 'var(--rose-dim)' }}>
              {unratedCount}
            </span>
            <span className="peliculas-stat-card-label">Sin calificar</span>
          </div>
          <div className="peliculas-stat-card">
            <span className="peliculas-stat-card-val">
              {lastWatched ? lastWatched.title : '—'}
            </span>
            <span className="peliculas-stat-card-label">Última vista</span>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <PeliculasContent
        movies={filtered}
        view={view}
        onSelect={setSelectedMovie}
        onClearFilters={() => { setRatingFilter(new Set()); setGenreFilter(''); }}
      />

      {/* ── Search overlay ── */}
      {showSearch && (
        <PeliculasSearchOverlay
          existingTmdbIds={new Set(movies.map(m => m.tmdb_id))}
          currentUserName={currentUserName}
          onClose={() => setShowSearch(false)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Detail modal ── */}
      {selectedMovie && (
        <PeliculaModal
          movie={selectedMovie}
          currentUserName={currentUserName}
          onClose={() => setSelectedMovie(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
