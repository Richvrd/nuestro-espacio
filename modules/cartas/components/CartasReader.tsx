'use client';

import { Letter, MOODS } from '../types';

interface CartasReaderProps {
  letter: Letter | null;
  currentUserName: string;
  onEdit: (letter: Letter) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function CartasReader({ letter, currentUserName, onEdit, onDelete, onBack }: CartasReaderProps) {
  if (!letter) {
    return (
      <div className="cartas-reader">
        <div className="cartas-reader-empty">
          <span className="cartas-reader-empty-icon">✦</span>
          <span className="cartas-reader-empty-title">Selecciona una carta para leerla</span>
          <span className="cartas-reader-empty-sub">o escribe una nueva</span>
        </div>
      </div>
    );
  }

  const moodInfo = letter.mood ? MOODS.find(m => m.value === letter.mood) : null;

  const formatReaderDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const bodyParagraphs = letter.body
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block, i) => {
      const lines = block.split('\n').filter(Boolean);
      if (lines.length === 1) return <p key={i}>{lines[0]}</p>;
      return (
        <p key={i}>
          {lines.map((line, j) => (
          <span key={j}>{j > 0 && <br />}{line}</span>
          ))}
        </p>
      );
    });

  return (
    <div className="cartas-reader">
      <button className="cartas-reader-back" onClick={onBack}>← volver</button>
      <div className="cartas-reader-content" key={letter.id}>
        <div className="cartas-reader-header">
          {moodInfo && (
            <span
              className="cartas-mood-pill"
              style={{
                borderColor: moodInfo.color,
                color: moodInfo.color,
                background: `${moodInfo.color}15`,
              }}
            >
              {moodInfo.emoji} {moodInfo.label}
            </span>
          )}
          <div className="cartas-reader-fromto">
            de {letter.from_name} → para {letter.to_name}
          </div>
          <h1 className={`cartas-reader-subject${letter.unread ? ' unread' : ''}`}>
            {letter.subject}
          </h1>
          <div className="cartas-reader-date">{formatReaderDate(letter.created_at)}</div>
          {letter.from_name === currentUserName && (
            <div className="cartas-reader-actions">
              <button className="cartas-reader-btn" onClick={() => onEdit(letter)}>editar</button>
              <button className="cartas-reader-btn cartas-reader-btn--del" onClick={() => onDelete(letter.id)}>eliminar</button>
            </div>
          )}
        </div>
        <div className="cartas-reader-body">
          {bodyParagraphs}
        </div>
        <div className="cartas-reader-sig">— {letter.from_name}</div>
      </div>
    </div>
  );
}
