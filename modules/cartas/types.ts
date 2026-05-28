export interface Letter {
  id: string;
  from_name: string;
  to_name: string;
  subject: string;
  body: string;
  unread: boolean | null;
  created_at: string;
}
