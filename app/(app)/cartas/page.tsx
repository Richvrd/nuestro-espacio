import { getLetters } from '@/modules/cartas/actions';
import { CartasApp } from '@/modules/cartas/components/CartasApp';
import { createClient } from '@/lib/supabase/server';
import { USER_EMAIL_MAP, COUPLE } from '@/lib/constants';

export default async function CartasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;
  const currentUserName = email ? (USER_EMAIL_MAP[email] ?? COUPLE.name2) : COUPLE.name2;

  const letters = await getLetters();
  return <CartasApp initialLetters={letters} currentUserName={currentUserName} />;
}
