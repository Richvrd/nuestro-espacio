'use client';

interface AddBetweenButtonProps {
  prevDate: string | null;
  nextDate: string | null;
  onClick: (prevDate: string | null, nextDate: string | null) => void;
}

export function AddBetweenButton({ prevDate, nextDate, onClick }: AddBetweenButtonProps) {
  return (
    <div className="add-between">
      <button className="add-between-btn" onClick={() => onClick(prevDate, nextDate)}>
        + agregar momento aquí
      </button>
    </div>
  );
}
