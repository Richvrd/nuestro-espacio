export type MomentIntensity = 'normal' | 'high' | 'vhigh';
export type MomentCategory  = 'primer-vez' | 'viaje' | 'celebracion' | 'cotidiano' | 'hito';

export interface Moment {
  id: string;
  title: string;
  description: string | null;
  private_note: string | null;
  date: string;
  intensity: MomentIntensity;
  category: MomentCategory;
  emoji: string;
  created_at: string;
}

export function getMomentYear(m: Moment): number {
  return parseInt(m.date.split('-')[0], 10);
}

export const CATEGORY_META: Record<MomentCategory, { label: string; cssClass: string }> = {
  'primer-vez':  { label: '💫 primer vez',  cssClass: 'cat-primer-vez'  },
  'viaje':       { label: '🌊 viaje',       cssClass: 'cat-viaje'       },
  'celebracion': { label: '✨ celebración', cssClass: 'cat-celebracion' },
  'cotidiano':   { label: '☁️ cotidiano',   cssClass: 'cat-cotidiano'   },
  'hito':        { label: '🪐 hito',        cssClass: 'cat-hito'        },
};

export const INTENSITY_META: Record<MomentIntensity, { badgeLabel: string; badgeCssClass: string }> = {
  normal: { badgeLabel: '',          badgeCssClass: 'badge-normal' },
  high:   { badgeLabel: '★ especial', badgeCssClass: 'badge-high'  },
  vhigh:  { badgeLabel: '✦ hito',    badgeCssClass: 'badge-vhigh' },
};
