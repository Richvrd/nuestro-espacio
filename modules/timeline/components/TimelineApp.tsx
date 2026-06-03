'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Moment } from '../types';
import { getMomentYear } from '../types';
import { useMoments } from '../hooks/useMoments';
import { YearFilter } from './YearFilter';
import { TimelineView } from './TimelineView';
import { MomentModal } from './MomentModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

type ModalState =
  | null
  | { mode: 'create'; prevDate: string | null; nextDate: string | null }
  | { mode: 'edit'; moment: Moment }
  | { mode: 'delete'; momentId: string };

interface TimelineAppProps {
  initialMoments: Moment[];
}

export function TimelineApp({ initialMoments }: TimelineAppProps) {
  const { moments, loading, saving, refresh, create, update, remove } = useMoments(initialMoments);
  const toast = useToast();

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null);
  const prevYearRef = useRef(selectedYear);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');

  const availableYears = useMemo(() => {
    return [...new Set(moments.map(getMomentYear))].sort((a, b) => a - b);
  }, [moments]);

  const visibleMoments = useMemo(() => {
    if (selectedYear === 'all') return moments;
    return moments.filter(m => getMomentYear(m) === selectedYear);
  }, [moments, selectedYear]);

  const momentCountByYear = useMemo(() => {
    const counts: Record<number, number> = {};
    moments.forEach(m => {
      const y = getMomentYear(m);
      counts[y] = (counts[y] || 0) + 1;
    });
    return counts;
  }, [moments]);

  const stats = useMemo(() => {
    const years = new Set(moments.map(getMomentYear));
    return {
      total: moments.length,
      vhigh: moments.filter(m => m.intensity === 'vhigh').length,
      viajes: moments.filter(m => m.category === 'viaje').length,
      years: years.size,
    };
  }, [moments]);

  const handleCreate = async (payload: Parameters<typeof create>[0]) => {
    await create(payload);
    setModalState(null);
    toast.success('✨ momento guardado');
  };

  const handleEdit = async (payload: Parameters<typeof create>[0]) => {
    if (modalState?.mode !== 'edit') return;
    await update(modalState.moment.id, payload as Parameters<typeof update>[1]);
    setModalState(null);
    toast.success('✎ momento actualizado');
  };

  const handleDelete = async () => {
    if (modalState?.mode !== 'delete') return;
    await remove(modalState.momentId);
    setModalState(null);
    toast.success('🗑 momento eliminado');
  };

  const handleYearChange = useCallback((year: number | 'all') => {
    const prev = prevYearRef.current;
    if (prev !== 'all' && year !== 'all') {
      if (year > prev) setSlideDir('next');
      else if (year < prev) setSlideDir('prev');
    }
    setSelectedYear(year);
    setTimeout(() => setSlideDir(null), 400);
  }, []);

  useEffect(() => {
    prevYearRef.current = selectedYear;
  }, [selectedYear]);

  return (
    <>
      {/* Header — estilo demo */}
      <div className="tl-header">
        <p className="tl-header-label">nuestra historia</p>
        <h1>Línea de Tiempo — Nuestra <em>historia</em></h1>
        <p className="tl-header-sub">cada momento, cada lugar, cada vez que dijimos &laquo;esto hay que recordarlo&raquo;</p>
      </div>

      {/* Stats bar */}
      {moments.length > 0 && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-val">{stats.total}</span>
            <span className="stat-label">momento{stats.total !== 1 ? 's' : ''}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-val">{stats.vhigh}</span>
            <span className="stat-label">hito{stats.vhigh !== 1 ? 's' : ''}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-val">{stats.viajes}</span>
            <span className="stat-label">viaje{stats.viajes !== 1 ? 's' : ''}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-val">{stats.years}</span>
            <span className="stat-label">año{stats.years !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Top bar: view toggle + nuevo momento */}
      <div className="top-bar">
        <div className="view-toggle">
          <button
            className={`vt-btn${viewMode === 'compact' ? ' active' : ''}`}
            onClick={() => setViewMode('compact')}
          >
            compacto
          </button>
          <button
            className={`vt-btn${viewMode === 'expanded' ? ' active' : ''}`}
            onClick={() => setViewMode('expanded')}
          >
            extendido
          </button>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModalState({ mode: 'create', prevDate: null, nextDate: null })}
        >
          + nuevo momento
        </button>
      </div>

      {availableYears.length > 0 && (
        <YearFilter
          years={availableYears}
          momentCountByYear={momentCountByYear}
          selectedYear={selectedYear}
          onSelect={handleYearChange}
        />
      )}

      {moments.length === 0 ? (
        <EmptyState icon="⏳" title="Todavía no hay momentos" subtitle="agrega el primer momento de su historia" />
      ) : (
        <div className={`tl-view-wrapper ${viewMode}${slideDir ? ` slide-${slideDir}` : ''}`}>
          <TimelineView
            moments={visibleMoments}
            viewMode={viewMode}
            onAddBetween={(prevDate, nextDate) => setModalState({ mode: 'create', prevDate, nextDate })}
            onEdit={(moment) => setModalState({ mode: 'edit', moment })}
            onDelete={(momentId) => setModalState({ mode: 'delete', momentId })}
          />
        </div>
      )}

      {modalState?.mode === 'create' && (
        <MomentModal
          mode="create"
          prevDate={modalState.prevDate}
          nextDate={modalState.nextDate}
          onClose={() => setModalState(null)}
          onSave={handleCreate}
          saving={saving}
        />
      )}

      {modalState?.mode === 'edit' && (
        <MomentModal
          mode="edit"
          editMoment={modalState.moment}
          onClose={() => setModalState(null)}
          onSave={handleEdit}
          saving={saving}
        />
      )}

      {modalState?.mode === 'delete' && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  );
}
