import { EmptyState } from '@/components/ui/EmptyState';

export default function CapsulaPage() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-subtitle">mensajes del futuro</div>
          <h1 className="page-title">Cápsula del tiempo</h1>
        </div>
      </div>
      <EmptyState 
        icon="⏳" 
        title="Este módulo estará disponible pronto" 
        subtitle="próximamente podrás crear cápsulas para el futuro" 
      />
    </div>
  );
}