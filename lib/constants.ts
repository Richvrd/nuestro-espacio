export const COUPLE = {
  name1: 'Sarai',
  name2: 'Ricardo',
  startDate: new Date(2026, 1, 7, 4, 45, 0, 0), // 7 de febrero 2026 a las 4:45, hora local
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