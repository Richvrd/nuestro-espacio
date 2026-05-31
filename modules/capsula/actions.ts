'use server';

import { createClient } from '@/lib/supabase/server';
import { encryptMessage, decryptMessage } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';
import type { Capsule } from './types';

export async function getCapsulas(): Promise<Capsule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('capsules')
    .select('*')
    .eq('visible', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const now = new Date();
  return Promise.all(
    (data as Capsule[]).map(async (cap) => {
      if (new Date(cap.open_date) <= now && cap.body) {
        try {
          cap.decryptedBody = await decryptMessage(cap.body);
        } catch {
          cap.decryptedBody = '[no se pudo descifrar el mensaje]';
        }
      }
      return cap;
    })
  );
}

export async function getCapsulasEspacio(): Promise<Pick<Capsule, 'id' | 'subject' | 'to_name' | 'open_date' | 'created_at'>[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('capsules')
    .select('id, subject, to_name, open_date, created_at')
    .eq('visible', false)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function insertCapsula(
  subject: string,
  to_name: string,
  body: string,
  open_date: string
): Promise<Capsule> {
  const supabase = await createClient();
  const encryptedBody = await encryptMessage(body);

  const { data, error } = await supabase
    .from('capsules')
    .insert({ subject, to_name, body: encryptedBody, open_date, visible: true })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/capsula');
  return data as Capsule;
}

export async function sendToSpace(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('capsules')
    .update({ visible: false })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/capsula');
}

export async function restoreCapsula(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('capsules')
    .update({ visible: true })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/capsula');
}
