'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Letter } from './types';

export async function getLetters(): Promise<Letter[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('letters')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function insertLetter(
  from_name: string,
  to_name: string,
  subject: string,
  body: string,
  mood: string | null
): Promise<{ success: boolean; error?: string; letter?: Letter }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('letters')
    .insert({ from_name, to_name, subject, body, unread: true, mood })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/cartas');
  return { success: true, letter: data };
}

export async function updateLetter(
  id: string,
  subject: string,
  body: string,
  mood: string | null
): Promise<{ success: boolean; error?: string; letter?: Letter }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('letters')
    .update({ subject, body, mood })
    .eq('id', id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/cartas');
  return { success: true, letter: data };
}

export async function deleteLetter(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('letters').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/cartas');
  return { success: true };
}

export async function markLetterRead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('letters').update({ unread: false }).eq('id', id);
  revalidatePath('/cartas');
}
