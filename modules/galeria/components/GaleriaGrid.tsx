'use client';

import { useState, useMemo, useEffect, useCallback, startTransition } from 'react';
import { useFotos } from '@/modules/galeria/hooks/useFotos';
import { Photo, Album, GaleriaItem } from '@/modules/galeria/types';
import { toggleSpecialMomento } from '@/modules/galeria/actions';
import { FotoCard } from './FotoCard';
import { AlbumCard } from './AlbumCard';
import { FotoModal } from './FotoModal';
import { AlbumModal } from './AlbumModal';
import { UploadModal } from './UploadModal';
import { TimelineView } from './TimelineView';
import { EmptyState } from '@/components/ui/EmptyState';

interface GaleriaGridProps {
  initialPhotos: Photo[];
  initialAlbums: Album[];
}

type ViewMode = 'grid' | 'timeline';
type FilterMode = 'all' | 'special' | 'albums' | 'photos';

const STORAGE_KEY = 'galeria-view';

export function GaleriaGrid({ initialPhotos, initialAlbums }: GaleriaGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [openPhotoId, setOpenPhotoId] = useState<string | null>(null);
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);

  const {
    photos, albums,
    uploadFoto, uploadAlbum,
    editFoto, editAlbum, deleteFoto, deleteAlbum,
    refresh,
  } = useFotos(initialPhotos, initialAlbums);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'grid' || saved === 'timeline') startTransition(() => setViewMode(saved));
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const openPhoto = openPhotoId ? photos.find(p => p.id === openPhotoId) ?? null : null;
  const openAlbum = openAlbumId ? albums.find(a => a.id === openAlbumId) ?? null : null;

  const items = useMemo((): GaleriaItem[] => {
    const result: GaleriaItem[] = [
      ...photos.map(p => ({ type: 'photo' as const, data: p })),
      ...albums.map(a => ({ type: 'album' as const, data: a })),
    ];
    return result;
  }, [photos, albums]);

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'special':
        return items.filter(i => i.type === 'photo' && i.data.is_special);
      case 'albums':
        return items.filter(i => i.type === 'album');
      case 'photos':
        return items.filter(i => i.type === 'photo');
      default:
        return items;
    }
  }, [items, filter]);

  const filteredPhotos = useMemo(() => {
    if (filter === 'albums') return [];
    if (filter === 'special') return photos.filter(p => p.is_special);
    return photos;
  }, [photos, filter]);

  const filteredAlbums = useMemo(() => {
    if (filter === 'photos' || filter === 'special') return [];
    return albums;
  }, [albums, filter]);

  const stats = useMemo(() => ({
    photos: photos.length,
    albums: albums.length,
    special: photos.filter(p => p.is_special).length,
  }), [photos, albums]);

  const handleToggleSpecial = useCallback(async (photo: Photo) => {
    try {
      await toggleSpecialMomento(photo.id, photo.is_special);
      await refresh();
    } catch {
      // Silently fail
    }
  }, [refresh]);

  const total = photos.length + albums.length;

  return (
    <>
      {/* Header actions + view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>Subir foto</button>
        <div className="view-toggle">
          <button
            className={`view-btn${viewMode === 'timeline' ? ' active' : ''}`}
            onClick={() => handleViewModeChange('timeline')}
          >
            Línea del tiempo
          </button>
          <button
            className={`view-btn${viewMode === 'grid' ? ' active' : ''}`}
            onClick={() => handleViewModeChange('grid')}
          >
            Cuadrícula
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="gallery-stats-row">
        <div className="gallery-stat-item">
          <span className="gallery-stat-val">{stats.photos}</span>
          <span className="gallery-stat-label">foto{stats.photos !== 1 ? 's' : ''}</span>
        </div>
        <div className="gallery-stat-sep" />
        <div className="gallery-stat-item">
          <span className="gallery-stat-val">{stats.albums}</span>
          <span className="gallery-stat-label">álbum{stats.albums !== 1 ? 'es' : ''}</span>
        </div>
        <div className="gallery-stat-sep" />
        <div className="gallery-stat-item">
          <span className="gallery-stat-val rose">{stats.special}</span>
          <span className="gallery-stat-label">momento{stats.special !== 1 ? 's' : ''} especial{stats.special !== 1 ? 'es' : ''}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="gallery-filter-bar">
        <span className="filter-label">Filtrar:</span>
        <button className={`filter-chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
          ✦ Todos
        </button>
        <button className={`filter-chip${filter === 'special' ? ' active' : ''}`} onClick={() => setFilter('special')}>
          ★ Momentos especiales
        </button>
        <button className={`filter-chip${filter === 'albums' ? ' active' : ''}`} onClick={() => setFilter('albums')}>
          🗂 Solo álbumes
        </button>
        <button className={`filter-chip${filter === 'photos' ? ' active' : ''}`} onClick={() => setFilter('photos')}>
          📸 Solo fotos
        </button>
      </div>

      {viewMode === 'grid' ? (
        <>
          <div className="gallery-grid">
            {filteredPhotos.length === 0 && filteredAlbums.length === 0 && (
              <EmptyState
                icon="📸"
                title={filter === 'special' ? 'Sin momentos especiales' : 'Aún no hay fotos'}
                subtitle={filter === 'special' ? 'marca fotos como especiales para verlas aquí' : 'sean los primeros en subir un recuerdo'}
              />
            )}

            {filteredPhotos.map((photo, i) => (
              <FotoCard key={photo.id} photo={photo} index={i} onOpen={() => setOpenPhotoId(photo.id)} />
            ))}

            {filteredAlbums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} onOpen={() => setOpenAlbumId(album.id)} />
            ))}

            <button className="upload-zone" onClick={() => setUploadOpen(true)}>
              <span className="upload-icon">+</span>
              <span className="upload-label">Subir<br />foto</span>
            </button>
          </div>
        </>
      ) : (
        <TimelineView
          items={filteredItems}
          onPhotoClick={(photo) => setOpenPhotoId(photo.id)}
          onAlbumClick={(album) => setOpenAlbumId(album.id)}
          onToggleSpecial={handleToggleSpecial}
        />
      )}

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
          onDeletePhoto={deleteFoto}
          onDeleteAlbum={deleteAlbum}
        />
      )}
    </>
  );
}
