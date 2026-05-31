'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Moment } from './types';

export async function getMoments(): Promise<Moment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Moment[];
}

export async function insertMoment(payload: {
  title: string;
  description?: string;
  private_note?: string;
  date: string;
  intensity: string;
  category: string;
  emoji: string;
}): Promise<Moment> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('moments')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/linea-de-tiempo');
  return data as Moment;
}

export async function updateMoment(
  id: string,
  payload: Partial<Pick<Moment, 'title' | 'description' | 'private_note' | 'date' | 'intensity' | 'category' | 'emoji'>>
): Promise<Moment> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('moments')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/linea-de-tiempo');
  return data as Moment;
}

export async function deleteMoment(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('moments').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/linea-de-tiempo');
}
