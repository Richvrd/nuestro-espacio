export interface Movie {
  id:         string;
  tmdb_id:    number;
  title:      string;
  year:       string | null;
  poster_url: string | null;
  overview:   string | null;
  genres:     string[] | null;
  runtime:    number | null;
  director:   string | null;
  vote_avg:   number | null;
  rating:     'SSS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | null;
  notes:      string | null;
  watched_at: string | null;
  added_by:   string;
  created_at: string;
}

export interface TmdbResult {
  tmdb_id:    number;
  title:      string;
  year:       string | null;
  poster_url: string | null;
  overview:   string | null;
  vote_avg:   number | null;
}

export const RATINGS = ['SSS', 'S', 'A', 'B', 'C', 'D', 'F'] as const;

export const RATING_COLORS: Record<string, string> = {
  SSS: '#a78bfa',
  S:   '#a78bfa',
  A:   '#7ab58a',
  B:   '#67e8f9',
  C:   '#8d86a8',
  D:   '#b58a7a',
  F:   '#f472b6',
};
