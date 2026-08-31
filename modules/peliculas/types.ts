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
  SSS: '#f2765f',
  S:   '#f2765f',
  A:   '#7ab58a',
  B:   '#e8c56a',
  C:   '#a89a8a',
  D:   '#b58a7a',
  F:   '#f2b48a',
};
