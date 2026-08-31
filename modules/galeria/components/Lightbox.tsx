'use client';

import { useEffect, useCallback } from 'react';
import { Photo } from '../types';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ photos, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const photo = photos[currentIndex];
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate(currentIndex - 1);
    if (e.key === 'ArrowRight') onNavigate(currentIndex + 1);
  }, [onClose, onNavigate, currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !photo) return null;

  const formattedDate = new Date(photo.date || photo.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div id="lightbox" className={isOpen ? 'open' : ''} onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      
      {currentIndex > 0 && (
        <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}>
          ‹
        </button>
      )}
      
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        {photo.url ? (
          <img id="lightbox-img" src={photo.url} alt={photo.caption || 'Foto'} />
        ) : (
          <div id="lightbox-placeholder" style={{ background: photo.bg_gradient || 'linear-gradient(135deg, #3a2b20, #261c14)' }}>
            {photo.emoji || '📷'}
          </div>
        )}
        <div className="lightbox-info">
          {photo.caption && <div className="lightbox-caption">{photo.caption}</div>}
          <div className="lightbox-date">{formattedDate}</div>
        </div>
      </div>
      
      {currentIndex < photos.length - 1 && (
        <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}>
          ›
        </button>
      )}
    </div>
  );
}