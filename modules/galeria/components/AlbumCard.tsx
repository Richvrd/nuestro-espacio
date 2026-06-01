'use client';

import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  index: number;
  onOpen: () => void;
}

export function AlbumCard({ album, index, onOpen }: AlbumCardProps) {
  const cover = album.photos.slice(0, 2);

  return (
    <div className={`photo-card album-card ${index % 2 === 0 ? '' : 'odd'}`} style={{ '--stagger-i': index } as React.CSSProperties} onClick={onOpen}>
      {/* Naipes apilados */}
      <div className="album-stack">
        {cover[1] && (
          <div className="album-stack-back">
            <img src={cover[1].url || ''} alt="" />
          </div>
        )}
        <div className="album-stack-front">
          <img src={cover[0].url || ''} alt={album.title} />
        </div>
      </div>

      <div className="photo-overlay">
        <div className="photo-caption">{album.title}</div>
        <div className="photo-date">{album.photos.length} fotos</div>
      </div>
    </div>
  );
}
