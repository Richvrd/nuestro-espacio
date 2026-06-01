'use client';

import { useMemo, useState } from 'react';
import { getMonthYear } from '@/lib/constants';
import type { Photo, Album, GaleriaItem } from '../types';

interface TimelineViewProps {
  items: GaleriaItem[];
  onPhotoClick: (photo: Photo) => void;
  onAlbumClick: (album: Album) => void;
  onToggleSpecial: (photo: Photo) => void;
}

type MonthGroup = {
  key: string;
  label: string;
  items: GaleriaItem[];
  featuredPhoto: Photo | null;
};

function parsePhotoDate(dateStr: string): Date {
  const monthsMap: Record<string, number> = {
    'ene.': 0, 'ene': 0,
    'feb.': 1, 'feb': 1,
    'mar.': 2, 'mar': 2,
    'abr.': 3, 'abr': 3,
    'may.': 4, 'may': 4,
    'jun.': 5, 'jun': 5,
    'jul.': 6, 'jul': 6,
    'ago.': 7, 'ago': 7,
    'sep.': 8, 'sep': 8,
    'oct.': 9, 'oct': 9,
    'nov.': 10, 'nov': 10,
    'dic.': 11, 'dic': 11,
  };

  const cleaned = dateStr.replace(/\./g, '').trim();
  const parts = cleaned.split(' ');

  if (parts.length >= 2) {
    const month = monthsMap[parts[0].toLowerCase()] ?? 0;
    const year = parseInt(parts[1]) || new Date().getFullYear();
    return new Date(year, month, 1);
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getItemDate(item: GaleriaItem): Date {
  if (item.type === 'photo') {
    return parsePhotoDate(item.data.date);
  }
  return new Date(item.data.created_at);
}

function formatMonthKey(item: GaleriaItem): string {
  const d = getItemDate(item);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const [year, m] = key.split('-');
  return `${months[parseInt(m)]} de ${year}`;
}

const MAX_VISIBLE = 7;

export function TimelineView({ items, onPhotoClick, onAlbumClick, onToggleSpecial }: TimelineViewProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const monthGroups = useMemo(() => {
    const groups: Record<string, MonthGroup> = {};

    for (const item of items) {
      const key = formatMonthKey(item);
      if (!groups[key]) {
        groups[key] = { key, label: monthLabel(key), items: [], featuredPhoto: null };
      }
      groups[key].items.push(item);
    }

    for (const g of Object.values(groups)) {
      const photos = g.items.filter((i): i is { type: 'photo'; data: Photo } => i.type === 'photo');
      const special = photos.find(p => p.data.is_special);
      g.featuredPhoto = special ? special.data : (photos[0]?.data ?? null);
    }

    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [items]);

  const toggleExpand = (key: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (monthGroups.length === 0) return null;

  return (
    <div className="timeline gallery-timeline">
      {monthGroups.map((group, idx) => {
        const isExpanded = expandedMonths.has(group.key);
        const featured = group.featuredPhoto;
        const hasFeatured = featured !== null;

        // Separate featured from rail items
        const railItems = hasFeatured
          ? group.items.filter(i => !(i.type === 'photo' && i.data.id === featured!.id))
          : group.items;

        const hasMore = railItems.length > MAX_VISIBLE;
        const visibleRail = isExpanded ? railItems : railItems.slice(0, MAX_VISIBLE);
        const hiddenCount = railItems.length - MAX_VISIBLE;

        const photoCount = group.items.filter(i => i.type === 'photo').length;
        const albumCount = group.items.filter(i => i.type === 'album').length;
        const totalLabel = photoCount > 0 && albumCount > 0
          ? `${photoCount} foto${photoCount !== 1 ? 's' : ''} · ${albumCount} álbum${albumCount !== 1 ? 'es' : ''}`
          : photoCount > 0
            ? `${photoCount} foto${photoCount !== 1 ? 's' : ''}`
            : `${albumCount} álbum${albumCount !== 1 ? 'es' : ''}`;

        return (
          <div className="month-section" key={group.key} style={{ '--stagger-i': idx } as React.CSSProperties}>
            <div className="month-header">
              <div className="month-label">
                <span className="month-name">{group.label.split(' de ')[0]}</span>
                <span className="month-year">{group.label.split(' de ')[1]}</span>
              </div>
              <span className="month-count">{totalLabel}</span>
              <div className="month-line" />
            </div>

            <div className={`month-content${hasFeatured ? '' : ' no-featured'}`}>
              {hasFeatured && (
                <div className="featured-photo" onClick={() => onPhotoClick(featured!)}>
                  {featured!.url ? (
                    <img src={featured!.url} alt={featured!.title || 'Foto destacada'} />
                  ) : (
                    <div
                      className="photo-placeholder-inner"
                      style={{ background: featured!.bg_gradient || 'linear-gradient(135deg,#2a1f35,#1a1924)' }}
                    >
                      {featured!.emoji || '📷'}
                    </div>
                  )}
                  <div className="featured-badge">destacada</div>
                  {featured!.is_special && <div className="special-badge-featured">★</div>}
                  <div className="featured-overlay">
                    {featured!.caption && <div className="featured-caption">{featured!.caption}</div>}
                    <div className="featured-date">{featured!.date}</div>
                  </div>
                </div>
              )}

              <div className="photos-rail">
                <div className="photos-row">
                  {visibleRail.map((item) => {
                    if (item.type === 'photo') {
                      const p = item.data;
                      return (
                        <div className="photo-card" key={p.id} onClick={() => onPhotoClick(p)}>
                          {p.url ? (
                            <img src={p.url} alt={p.title || 'Foto'} className="photo-thumb" />
                          ) : (
                            <div
                              className="photo-thumb-placeholder"
                              style={{ background: p.bg_gradient || 'linear-gradient(135deg,#2a1f35,#1a1924)' }}
                            >
                              {p.emoji || '📷'}
                            </div>
                          )}
                          <button
                            className={`special-toggle-btn${p.is_special ? ' is-special' : ''}`}
                            onClick={e => { e.stopPropagation(); onToggleSpecial(p); }}
                          >
                            {p.is_special ? '★' : '☆'}
                          </button>
                          <div className="photo-overlay">
                            {p.caption && <div className="photo-caption">{p.caption}</div>}
                          </div>
                        </div>
                      );
                    }

                    const a = item.data as Album;
                    const cover = a.photos.slice(0, 2);
                    return (
                      <div className="photo-card album-card" key={a.id} onClick={() => onAlbumClick(a)}>
                        <div className="album-stack">
                          {cover[1] && (
                            <div className="album-stack-back">
                              <img src={cover[1].url || ''} alt="" />
                            </div>
                          )}
                          <div className="album-stack-front">
                            <img src={cover[0].url || ''} alt={a.title} />
                          </div>
                        </div>
                        <div className="photo-overlay">
                          <div className="photo-caption">{a.title}</div>
                          <div className="photo-date">{a.photos.length} foto{a.photos.length !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    );
                  })}

                  {hasMore && !isExpanded && (
                    <div className="more-card" onClick={() => toggleExpand(group.key)}>
                      <div className="more-count">+{hiddenCount}</div>
                      <div className="more-label">ver más</div>
                    </div>
                  )}

                  {isExpanded && hasMore && (
                    <div className="more-card" onClick={() => toggleExpand(group.key)}>
                      <div className="more-label">mostrar menos</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
