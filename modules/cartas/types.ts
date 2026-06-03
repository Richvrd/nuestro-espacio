export interface Letter {
  id: string;
  from_name: string;
  to_name: string;
  subject: string;
  body: string;
  unread: boolean | null;
  mood: string | null;
  created_at: string;
}

export type Mood = 'amor' | 'nostalgia' | 'gratitud' | 'alegría' | 'melancolía';

export const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: 'amor',       label: 'Amor',       emoji: '💗', color: '#b8756a' },
  { value: 'nostalgia',  label: 'Nostalgia',  emoji: '🌙', color: '#8a7ab5' },
  { value: 'gratitud',   label: 'Gratitud',   emoji: '✨', color: '#c9a96e' },
  { value: 'alegría',    label: 'Alegría',    emoji: '🌸', color: '#7ab58a' },
  { value: 'melancolía', label: 'Melancolía', emoji: '🌧', color: '#5a9ba5' },
];
