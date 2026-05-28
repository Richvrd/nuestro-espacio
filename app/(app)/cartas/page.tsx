import { getLetters } from '@/modules/cartas/actions';
import { CartasApp } from '@/modules/cartas/components/CartasApp';

export default async function CartasPage() {
  const letters = await getLetters();
  return (
    <div className="page active">
      <CartasApp initialLetters={letters} />
    </div>
  );
}
