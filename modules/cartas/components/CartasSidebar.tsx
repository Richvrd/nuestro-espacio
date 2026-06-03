'use client';

import { useMemo } from 'react';
import { Letter, MOODS } from '../types';

interface CartasSidebarProps {
  letters: Letter[];
  selectedId: string | null;
  activeTab: 'all' | 'unread' | 'from' | 'to';
  search: string;
  onSelect: (id: string) => void;
  onTabChange: (tab: 'all' | 'unread' | 'from' | 'to') => void;
  onSearchChange: (q: string) => void;
  onNewLetter: () => void;
}

export function CartasSidebar({
  letters, selectedId, activeTab, search,
  onSelect, onTabChange, onSearchChange, onNewLetter,
}: CartasSidebarProps) {
  const unreadCount = useMemo(() => letters.filter(l => l.unread).length, [letters]);

  const formatListItemDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const preview = (body: string) =>
    body.length > 80 ? body.slice(0, 80) + '…' : body;

  const moodColor = (mood: string | null) => {
    if (!mood) return null;
    const m = MOODS.find(m => m.value === mood);
    return m ? m.color : null;
  };

  return (
    <div className="cartas-sidebar">
      <div className="cartas-sidebar-header">
        <div className="cartas-sidebar-title-row">
          <h2 className="cartas-sidebar-title">cartas</h2>
          <button className="cartas-new-btn" onClick={onNewLetter}>+ escribir</button>
        </div>

        <input
          className="cartas-search"
          type="text"
          placeholder="buscar carta..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />

        <div className="cartas-tabs">
          {([
            { key: 'all',     label: 'Todas' },
            { key: 'unread',  label: 'No leídas' },
            { key: 'from',    label: 'De mí' },
            { key: 'to',      label: 'Para mí' },
          ] as const).map(t => (
            <button
              key={t.key}
              className={`cartas-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => onTabChange(t.key)}
            >
              {t.label}
              {t.key === 'unread' && unreadCount > 0 && (
                <span className="cartas-tab-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="cartas-list">
        {letters.length === 0 ? (
          <div className="cartas-empty">
            <span className="cartas-empty-icon">💌</span>
            <span className="cartas-empty-title">Aún no hay cartas</span>
            <span className="cartas-empty-sub">La primera estará esperando aquí</span>
          </div>
        ) : (
          letters.map(letter => {
            const isSelected = letter.id === selectedId;
            return (
              <div
                key={letter.id}
                className={`cartas-list-item${isSelected ? ' selected' : ''}`}
                onClick={() => onSelect(letter.id)}
              >
                <div className="cartas-list-item-top">
                  <span className="cartas-list-from">de {letter.from_name}</span>
                  <div className="cartas-list-indicators">
                    {letter.mood && (
                      <span className="mood-dot" style={{ background: moodColor(letter.mood) ?? 'var(--muted)' }} />
                    )}
                    {letter.unread && !isSelected && (
                      <span className="cartas-unread-dot" />
                    )}
                  </div>
                </div>
                <div className={`cartas-list-subject${letter.unread ? ' unread' : ''}`}>
                  {letter.subject}
                </div>
                <div className="cartas-list-preview">{preview(letter.body)}</div>
                <div className="cartas-list-date">{formatListItemDate(letter.created_at)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
