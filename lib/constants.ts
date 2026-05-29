export const COUPLE = {
  name1: 'Sarai',
  name2: 'Ricardo',
  startDate: new Date(Date.UTC(2026, 1, 7, 19, 45, 0)), // 7 feb 2026 16:45 Chile (UTC-3) → UTC
} as const;

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