'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAccesoInfo } from '@/lib/accesoInfo';

export async function logAcceso(
  email: string | null,
  exito: boolean | null,
  ruta: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const info = await getAccesoInfo();
    await supabase.from('accesos').insert({
      ip: info.ip,
      email,
      exito,
      user_agent: info.userAgent,
      pais: info.pais,
      ciudad: info.ciudad,
      ruta,
    });
  } catch {
    // nunca bloquear el flujo de login
  }
}

function mapError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
  if (msg.includes('Email not confirmed')) return 'Email no confirmado';
  return 'Algo salió mal, intenta de nuevo';
}

export async function loginAction(
  email: string,
  password: string
): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      await logAcceso(email, false, '/login');
      return mapError(authError.message);
    }
  } catch {
    await logAcceso(email, false, '/login');
    return 'Algo salió mal, intenta de nuevo';
  }

  await logAcceso(email, true, '/login');
  redirect('/inicio');
}
