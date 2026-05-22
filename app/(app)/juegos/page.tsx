import { EmptyState } from '@/components/ui/EmptyState';

export default function JuegosPage() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-subtitle">momento de jugar</div>
          <h1 className="page-title">Juegos</h1>
        </div>
      </div>
      <EmptyState 
        icon="🎮" 
        title="Este módulo estará disponible pronto" 
        subtitle="próximamente podrás jugar together" 
      />
    </div>
  );
}