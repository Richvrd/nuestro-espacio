import { EmptyState } from '@/components/ui/EmptyState';

export default function MusicaPage() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-subtitle">nuestra banda sonora</div>
          <h1 className="page-title">Música</h1>
        </div>
      </div>
      <EmptyState 
        icon="🎵" 
        title="Este módulo estará disponible pronto" 
        subtitle="próximamente podrás escuchar vuestra música" 
      />
    </div>
  );
}