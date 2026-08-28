'use server';

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