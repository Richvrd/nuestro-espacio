import { EmptyState } from '@/components/ui/EmptyState';

export default function CartasPage() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-subtitle">palabras del corazón</div>
          <h1 className="page-title">Cartas</h1>
        </div>
      </div>
      <EmptyState 
        icon="💌" 
        title="Este módulo estará disponible pronto" 
        subtitle="próximamente podrás escribir y leer cartas" 
      />
    </div>
  );
}