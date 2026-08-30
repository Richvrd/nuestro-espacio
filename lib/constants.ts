export const COUPLE = {
  name1: 'Sarai',
  name2: 'Ricardo',
  startDate: new Date(Date.UTC(2026, 1, 7, 19, 45, 0)), // 7 feb 2026 16:45 Chile (UTC-3) → UTC
} as const;

// Sesión por inactividad. MODO PRUEBAS: 2 min → cuando se pida, cambiar a 30 min.
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 * 60 * 1000
export const SESSION_WARNING_MS = 30 * 1000;
export const INACTIVITY_COOKIE = 'ne_last_activity';

export const USER_EMAIL_MAP: Record<string, string> = {
  'ricardoskypoblete@gmail.com': 'Ricardo',
  'saraijara3768@gmail.com': 'Sarai',
};

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function getMonthYear(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });
}