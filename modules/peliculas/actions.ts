'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Movie } from './types';

export async function getMovies(): Promise<Movie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('movies')
    .select('*')
    .order('watched_at', { ascending: false })
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addMovie(data: {
  tmdb_id: number;
  title: string;
  year: string | null;
  poster_url: string | null;
  overview: string | null;
  genres: string[] | null;
  runtime: number | null;
  director: string | null;
  vote_avg: number | null;
  rating: Movie['rating'];
  notes: string | null;
  watched_at: string | null;
  added_by: string;
}): Promise<{ success: boolean; movie?: Movie; error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('movies')
    .select('id')
    .eq('tmdb_id', data.tmdb_id)
    .maybeSingle();

  if (existing) return { success: false, error: 'duplicate' };

  const { data: movie, error } = await supabase
    .from('movies')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/peliculas');
  return { success: true, movie };
}

export async function updateMovie(
  id: string,
  data: {
    rating?: Movie['rating'] | null;
    notes?: string | null;
    watched_at?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('movies')
    .update(data)
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/peliculas');
  return { success: true };
}

export async function deleteMovie(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('movies').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/peliculas');
  return { success: true };
}
