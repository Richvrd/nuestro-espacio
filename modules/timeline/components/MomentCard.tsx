'use client';

import { useState } from 'react';
import type { Moment } from '../types';
import { CATEGORY_META, INTENSITY_META } from '../types';
import { MomentNode } from './MomentNode';

interface MomentCardProps {
  moment: Moment;
  side: 'left' | 'right';
  viewMode: 'compact' | 'expanded';
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function MomentCard({ moment, side, viewMode, onEdit, onDelete }: MomentCardProps) {
  const catMeta = CATEGORY_META[moment.category];
  const intMeta = INTENSITY_META[moment.intensity];
  const [expanded, setExpanded] = useState(false);

  const isExpanded = viewMode === 'expanded' || expanded;

  const handleCardClick = () => {
    if (viewMode === 'compact') {
      setExpanded(prev => !prev);
    }
  };

  return (
    <div className={`tl-item ${side}`}>
      <div className="tl-card-wrap">
        <div
          className={`tl-card intensity-${moment.intensity}${isExpanded ? ' card-expanded' : ''}`}
          onClick={handleCardClick}
        >
          <div className={`card-category ${catMeta.cssClass}`}>
            {catMeta.label}
          </div>
          <span className="card-emoji">{moment.emoji}</span>
          <div className="card-title">{moment.title}</div>
          <div className="card-date">{formatDate(moment.date)}</div>
          <div className="card-desc" style={moment.description ? {} : { display: 'none' }}>
            {moment.description || ''}
          </div>
          {moment.private_note && (
            <div className="card-private-note">{moment.private_note}</div>
          )}
          <div className="intensity-badge">
            <span className={intMeta.badgeCssClass}>{intMeta.badgeLabel || 'normal'}</span>
          </div>
          <div className="card-actions">
            <button className="btn btn-ghost btn-xs" onClick={e => { e.stopPropagation(); onEdit(); }}>
              ✎ editar
            </button>
            <button className="btn btn-ghost btn-xs" style={{ color: 'var(--rose)' }} onClick={e => { e.stopPropagation(); onDelete(); }}>
              🗑 eliminar
            </button>
          </div>
          <div className="tl-connector" />
        </div>
      </div>
      <div className="tl-node-wrap">
        <MomentNode intensity={moment.intensity} />
      </div>
      <div className="tl-empty" />
    </div>
  );
}
