import { getMoments } from '@/modules/timeline/actions';
import { TimelineApp } from '@/modules/timeline/components/TimelineApp';

export default async function LineaDeTiempoPage() {
  const moments = await getMoments();
  return (
    <div className="page active">
      <TimelineApp initialMoments={moments} />
    </div>
  );
}
