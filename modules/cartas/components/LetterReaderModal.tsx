'use client';

import { useState, useEffect, useCallback } from 'react';
import { Letter } from '../types';

interface LetterReaderModalProps {
  letter: Letter;
  onClose: () => void;
  onEdit: (letter: Letter) => void;
  onDelete: (id: string) => void;
}

export function LetterReaderModal({ letter, onClose, onEdit, onDelete }: LetterReaderModalProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const bodyWithParagraphs = letter.body
    .split('\n')
    .filter(l => l.trim())
    .map((l, i) => <p key={i}>{l}</p>);

  return (
    <div className="modal-backdrop">
      <div className="letter-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">carta</span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button className="three-dots-btn" onClick={() => setMenuOpen(o => !o)}>···</button>
              {menuOpen && (
                <div className="letter-menu-below">
                  <button onClick={() => { setMenuOpen(false); onEdit(letter); }}>
                    editar
                  </button>
                  <button className="delete-opt" onClick={() => { setMenuOpen(false); onDelete(letter.id); }}>
                    eliminar
                  </button>
                </div>
              )}
            </div>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="letter-reader-from">de {letter.from_name} · para {letter.to_name}</div>
        <h2 className="letter-reader-subject">{letter.subject}</h2>
        <div className="letter-reader-date">{formatDate(letter.created_at)}</div>
        <div className="letter-reader-body">{bodyWithParagraphs}</div>
        <div className="letter-reader-sig">{letter.from_name}</div>
      </div>
    </div>
  );
}
