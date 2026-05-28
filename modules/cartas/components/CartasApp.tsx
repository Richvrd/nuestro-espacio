'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { Letter } from '../types';
import { deleteLetter } from '../actions';
import { LetterReaderModal } from './LetterReaderModal';
import { WriteLetterModal } from './WriteLetterModal';

interface CartasAppProps {
  initialLetters: Letter[];
}

export function CartasApp({ initialLetters }: CartasAppProps) {
  const [letters, setLetters] = useState(initialLetters);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const router = useRouter();

  const handleSaved = (letter?: Letter) => {
    setShowWriteModal(false);
    setEditingLetter(null);
    if (letter) {
      setLetters(prev => {
        const exists = prev.find(l => l.id === letter.id);
        if (exists) return prev.map(l => (l.id === letter.id ? letter : l));
        return [letter, ...prev];
      });
    }
    router.refresh();
  };

  const handleEdit = (letter: Letter) => {
    setSelectedLetter(null);
    setEditingLetter(letter);
    setShowWriteModal(true);
  };

  const handleDelete = async (id: string) => {
    setLetters(prev => prev.filter(l => l.id !== id));
    setSelectedLetter(null);
    await deleteLetter(id);
    router.refresh();
  };

  const formatLetterDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const preview = (body: string, max = 100) =>
    body.length > max ? body.slice(0, max) + '…' : body;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-subtitle">palabras del corazón</div>
          <h1 className="page-title">Cartas</h1>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => { setEditingLetter(null); setShowWriteModal(true); }}
          >
            ✍ Escribir carta
          </button>
        </div>
      </div>

      {letters.length === 0 ? (
        <EmptyState
          icon="💌"
          title="Todavía no hay cartas"
          subtitle="escribe la primera carta"
        />
      ) : (
        <div className="gallery-grid">
          {letters.map(letter => (
            <div
              key={letter.id}
              className="card letter-card"
              onClick={() => setSelectedLetter(letter)}
            >
              <div className="li-from">{letter.from_name}</div>
              <div className="li-subject">{letter.subject}</div>
              <div className="li-preview">{preview(letter.body)}</div>
              <div className="li-date">{formatLetterDate(letter.created_at)}</div>
            </div>
          ))}
        </div>
      )}

      {selectedLetter && (
        <LetterReaderModal
          letter={selectedLetter}
          onClose={() => setSelectedLetter(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showWriteModal && (
        <WriteLetterModal
          editLetter={editingLetter}
          onClose={() => { setShowWriteModal(false); setEditingLetter(null); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
