import { getGaleriaItems } from '@/modules/galeria/actions';
import { GaleriaGrid } from '@/modules/galeria/components/GaleriaGrid';

export default async function GaleriaPage() {
  const { photos, albums } = await getGaleriaItems();

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-subtitle">nuestros recuerdos</div>
          <h1 className="page-title">Galería</h1>
        </div>
      </div>
      <GaleriaGrid initialPhotos={photos} initialAlbums={albums} />
    </div>
  );
}
