import { headers } from 'next/headers';

const PAISES: Record<string, string> = {
  CL: 'Chile',
  AR: 'Argentina',
  BO: 'Bolivia',
  CO: 'Colombia',
  EC: 'Ecuador',
  MX: 'México',
  PE: 'Perú',
  VE: 'Venezuela',
  US: 'Estados Unidos',
  ES: 'España',
};

export type AccesoInfo = {
  ip: string | null;
  pais: string | null;
  paisNombre: string | null;
  ciudad: string | null;
  userAgent: string | null;
};

export async function getAccesoInfo(): Promise<AccesoInfo> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for') ?? '';
  const ip = fwd.split(',')[0]?.trim() || null;
  const pais = h.get('x-vercel-ip-country');
  const ciudad = h.get('x-vercel-ip-city');
  const userAgent = h.get('user-agent');

  return {
    ip,
    pais,
    paisNombre: pais && PAISES[pais] ? PAISES[pais] : pais,
    ciudad,
    userAgent,
  };
}