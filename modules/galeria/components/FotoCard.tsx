'use client';

import { Photo } from '../types';

interface FotoCardProps {
  photo: Photo;
  index: number;
  onOpen: () => void;
}

export function FotoCard({ photo, index, onOpen }: FotoCardProps) {
  if (photo.url) {
    return (
      <div className={`photo-card ${index % 2 === 0 ? '' : 'odd'}`} style={{ '--stagger-i': index } as React.CSSProperties} onClick={onOpen}>
        <img src={photo.url} alt={photo.title || photo.caption || 'Foto'} className="photo-thumb" />
        {photo.is_special && <div className="special-badge">★</div>}
        <div className="photo-overlay">
          {photo.title && <div className="photo-caption">{photo.title}</div>}
          <div className="photo-date">{photo.caption}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`photo-card ${index % 2 === 0 ? '' : 'odd'}`}
      onClick={onOpen}
      style={{ '--stagger-i': index, background: photo.bg_gradient || 'linear-gradient(135deg,#2a2340,#1a1730)' } as React.CSSProperties}
    >
      <div className="photo-thumb-placeholder">{photo.emoji || '📷'}</div>
      {photo.is_special && <div className="special-badge">★</div>}
      <div className="photo-overlay">
        {photo.title && <div className="photo-caption">{photo.title}</div>}
        <div className="photo-date">{photo.caption}</div>
      </div>
    </div>
  );
}
