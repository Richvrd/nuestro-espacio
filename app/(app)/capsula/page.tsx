import { getCapsulas } from '@/modules/capsula/actions';
import { CapsulasApp } from '@/modules/capsula/components/CapsulasApp';

export default async function CapsulaPage() {
  const capsulas = await getCapsulas();
  return (
    <div className="page active">
      <CapsulasApp initialCapsulas={capsulas} />
    </div>
  );
}
