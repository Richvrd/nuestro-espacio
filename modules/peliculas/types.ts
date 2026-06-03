export interface Pelicula {
  id: string;
  title: string;
  poster_url?: string;
  year?: number;
  genre?: string;
  rating?: number;
  watched_at: string;
  notes?: string;
  created_at: string;
}
