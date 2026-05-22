'use client';

import { useState } from 'react';
import { useFotos } from '@/modules/galeria/hooks/useFotos';
import { Photo, Album } from '@/modules/galeria/types';
import { FotoCard } from './FotoCard';
import { AlbumCard } from './AlbumCard';
import { FotoModal } from './FotoModal';
import { AlbumModal } from './AlbumModal';
import { UploadModal } from './UploadModal';
import { EmptyState } from '@/components/ui/EmptyState';

interface GaleriaGridProps {
  initialPhotos: Photo[];
  initialAlbums: Album[];
}

export function GaleriaGrid({ initialPhotos, initialAlbums }: GaleriaGridProps) {
  const {
    photos, albums,
    uploadFoto, uploadAlbum,
    editFoto, editAlbum, deleteFoto, deleteAlbum,
  } = useFotos(initialPhotos, initialAlbums);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [openPhotoId, setOpenPhotoId] = useState<string | null>(null);
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);

  // Siempre leer la foto/album desde el estado reactivo, no desde el snapshot al abrir
  const openPhoto = openPhotoId ? photos.find(p => p.id === openPhotoId) ?? null : null;
  const openAlbum = openAlbumId ? albums.find(a => a.id === openAlbumId) ?? null : null;

  const handleDeletePhotos = async (ids: string[]) => {
    for (const id of ids) await deleteFoto(id);
  };

  const total = photos.length + albums.length;

  return (
    <>
      <div className="gallery-grid">
        {total === 0 && (
          <EmptyState
            icon="📸"
            title="Aún no hay fotos"
            subtitle="sean los primeros en subir un recuerdo"
          />
        )}

        {photos.map((photo, i) => (
          <FotoCard key={photo.id} photo={photo} index={i} onOpen={() => setOpenPhotoId(photo.id)} />
        ))}

        {albums.map((album, i) => (
          <AlbumCard key={album.id} album={album} index={i} onOpen={() => setOpenAlbumId(album.id)} />
        ))}

        <button className="upload-zone" onClick={() => setUploadOpen(true)}>
          <span className="upload-icon">+</span>
          <span className="upload-label">Subir<br />foto</span>
        </button>
      </div>

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onUploadPhoto={uploadFoto}
          onUploadAlbum={uploadAlbum}
        />
      )}

      {openPhoto && (
        <FotoModal
          photo={openPhoto}
          onClose={() => setOpenPhotoId(null)}
          onEdit={editFoto}
          onDelete={deleteFoto}
        />
      )}

      {openAlbum && (
        <AlbumModal
          album={openAlbum}
          onClose={() => setOpenAlbumId(null)}
          onEditAlbum={editAlbum}
          onDeletePhotos={handleDeletePhotos}
          onDeleteAlbum={deleteAlbum}
        />
      )}
    </>
  );
}
