export interface Capsule {
  id: string;
  subject: string;
  to_name: string;
  open_date: string;
  body: string | null;
  visible: boolean;
  created_at: string;
  decryptedBody?: string;
}

export type CapsuleStatus = 'sealed' | 'open';

export function getCapsuleStatus(capsule: Capsule): CapsuleStatus {
  return new Date(capsule.open_date) <= new Date() ? 'open' : 'sealed';
}
