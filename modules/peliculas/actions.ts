'use server';

import { createClient } from '@/lib/supabase/server';
import type { Pelicula } from './types';

export async function getPeliculas(): Promise<Pelicula[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('peliculas')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addPelicula(pelicula: Omit<Pelicula, 'id' | 'created_at'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('peliculas')
    .insert(pelicula)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePelicula(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('peliculas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
