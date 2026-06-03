'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { Capsule, getCapsuleStatus } from '../types';
import { useCapsulas } from '../hooks/useCapsulas';
import { CapsulaCard } from './CapsulaCard';
import { NuevaCapsulaModal, type CapsulaFormData } from './NuevaCapsulaModal';
import { ConfirmModal } from './ConfirmModal';
import { SealedModal } from './SealedModal';
import { ReaderModal } from './ReaderModal';
import { CosmosModal } from './CosmosModal';

interface CapsulasAppProps {
  initialCapsulas: Capsule[];
}

export function CapsulasApp({ initialCapsulas }: CapsulasAppProps) {
  const { capsulas, loading, saving, refresh, createCapsula, enviarAlEspacio } = useCapsulas(initialCapsulas);
  const toast = useToast();

  const [showNewModal, setShowNewModal] = useState(false);
  const [confirmData, setConfirmData] = useState<CapsulaFormData | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [showCosmos, setShowCosmos] = useState(false);

  const [justOpenedIds, setJustOpenedIds] = useState<Set<string>>(new Set());

  // Auto-unlock: every second check if any sealed capsule should now be open
  const checkAutoUnlock = useCallback(() => {
    let changed = false;
    capsulas.forEach(cap => {
      const status = getCapsuleStatus(cap);
      if (status === 'open' && !cap.decryptedBody && !justOpenedIds.has(cap.id)) {
        setJustOpenedIds(prev => new Set(prev).add(cap.id));
        changed = true;
      }
    });
    if (changed) {
      toast.success('💌 ¡una cápsula se acaba de abrir!');
      refresh().then(() => {
        setTimeout(() => setJustOpenedIds(new Set()), 2000);
      });
    }
  }, [capsulas, refresh, toast, justOpenedIds]);

  useEffect(() => {
    const id = setInterval(checkAutoUnlock, 1000);
    return () => clearInterval(id);
  }, [checkAutoUnlock]);

  const sealedCapsules = capsulas.filter(c => getCapsuleStatus(c) === 'sealed');
  const openCapsules = capsulas.filter(c => getCapsuleStatus(c) === 'open');

  const handleCreate = async () => {
    if (!confirmData) return;
    const dateTime = new Date(`${confirmData.openDate}T${confirmData.openTime}:00`).toISOString();
    await createCapsula(confirmData.subject, confirmData.toName, confirmData.body, dateTime);
    setConfirmData(null);
    setShowNewModal(false);
    toast.success('🔒 cápsula sellada y guardada');
  };

  const handleSendToSpace = (id: string) => {
    enviarAlEspacio(id);
    setSelectedCapsule(null);
    toast.success('🚀 cápsula enviada al espacio');
  };

  const handleRestore = () => {
    refresh();
  };

  const selectedStatus = selectedCapsule ? getCapsuleStatus(selectedCapsule) : null;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-subtitle">mensajes del futuro</div>
          <h1 className="page-title">Cápsula del tiempo</h1>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-cosmos" onClick={() => setShowCosmos(true)}>
            🚀 enviadas al espacio
          </button>
          <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
            + nueva cápsula
          </button>
        </div>
      </div>

      {capsulas.length === 0 ? (
        <EmptyState icon="⏳" title="Todavía no hay cápsulas" subtitle="crea la primera cápsula del tiempo" />
      ) : (
        <>
          {sealedCapsules.length > 0 && (
            <section>
              <div className="capsula-section-label">selladas · esperando su momento</div>
              <div className="capsulas-grid">
                {sealedCapsules.map((cap, i) => (
                  <CapsulaCard key={cap.id} capsule={cap} index={i}
                    onClick={() => setSelectedCapsule(cap)}
                    justOpened={justOpenedIds.has(cap.id)} />
                ))}
              </div>
            </section>
          )}

          {openCapsules.length > 0 && (
            <section>
              <div className="capsula-section-label">abiertas · listas para leer</div>
              <div className="capsulas-grid">
                {openCapsules.map((cap, i) => (
                  <CapsulaCard key={cap.id} capsule={cap} index={i}
                    onClick={() => setSelectedCapsule(cap)}
                    justOpened={false} />
                ))}
              </div>
            </section>
          )}

          {(loading) && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="spinner" />
            </div>
          )}
        </>
      )}

      {showNewModal && !confirmData && (
        <NuevaCapsulaModal
          onClose={() => setShowNewModal(false)}
          onConfirm={setConfirmData}
          saving={saving}
        />
      )}

      {showNewModal && confirmData && (
        <ConfirmModal
          data={confirmData}
          onBack={() => setConfirmData(null)}
          onConfirm={handleCreate}
          saving={saving}
        />
      )}

      {selectedCapsule && selectedStatus === 'sealed' && (
        <SealedModal
          capsule={selectedCapsule}
          onClose={() => setSelectedCapsule(null)}
          onSendToSpace={handleSendToSpace}
          saving={saving}
        />
      )}

      {selectedCapsule && selectedStatus === 'open' && (
        <ReaderModal
          capsule={selectedCapsule}
          onClose={() => setSelectedCapsule(null)}
          onSendToSpace={handleSendToSpace}
          saving={saving}
        />
      )}

      {showCosmos && (
        <CosmosModal
          onClose={() => setShowCosmos(false)}
          onRestore={handleRestore}
        />
      )}
    </>
  );
}
