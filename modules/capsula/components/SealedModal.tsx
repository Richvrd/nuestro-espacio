'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Capsule } from '../types';
import { COUPLE } from '@/lib/constants';

interface SealedModalProps {
  capsule: Capsule;
  onClose: () => void;
  onSendToSpace: (id: string) => void;
  saving: boolean;
}

function calcDiff(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const total = Math.floor(diff / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function SealedModal({ capsule, onClose, onSendToSpace, saving }: SealedModalProps) {
  const target = new Date(capsule.open_date);
  const [diff, setDiff] = useState(() => calcDiff(target));
  const rafRef = useRef<number | null>(null);
  const [sent, setSent] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !saving) onClose();
  }, [onClose, saving]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    let lastTick = performance.now();
    const tick = (now: number) => {
      if (now - lastTick >= 1000) {
        const d = calcDiff(target);
        setDiff(d);
        if (d.d === 0 && d.h === 0 && d.m === 0 && d.s === 0) onClose();
        lastTick = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleKey, target, onClose]);

  const openDateStr = target.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const openTimeStr = target.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handleSend = () => {
    setSent(true);
    onSendToSpace(capsule.id);
  };

  if (sent) return null;

  return (
    <div className="modal-backdrop">
      <div className="write-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">cápsula sellada</span>
          <button className="modal-close-btn" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="sealed-msg">
          <div className="sealed-icon">🔒</div>
          <strong>Esta cápsula está sellada</strong>
          <p>
            el mensaje está guardado de forma segura. podrás leerlo cuando llegue el momento.
          </p>

          <div className="scb-row">
            <SCBUnit value={diff.d} label="días" />
            <span className="scb-sep">:</span>
            <SCBUnit value={diff.h} label="hrs" />
            <span className="scb-sep">:</span>
            <SCBUnit value={diff.m} label="min" />
            <span className="scb-sep">:</span>
            <SCBUnit value={diff.s} label="seg" sec />
          </div>

          <p style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>
            se abre el {openDateStr} a las {openTimeStr}
          </p>
        </div>

        <div className="write-form-divider" />

        <div className="write-form-actions">
          <button className="btn btn-send-space" onClick={handleSend} disabled={saving}>
            🚀 enviar al espacio
          </button>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>cerrar</button>
        </div>
      </div>
    </div>
  );
}

function SCBUnit({ value, label, sec }: { value: number; label: string; sec?: boolean }) {
  return (
    <div className={`scb-unit${sec ? ' sec' : ''}`}>
      <span className="scb-val">{pad(value)}</span>
      <span className="scb-label">{label}</span>
    </div>
  );
}
