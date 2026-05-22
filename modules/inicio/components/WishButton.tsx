'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';

export function WishButton() {
  const [count, setCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [waves, setWaves] = useState<number[]>([]);

  const handleWish = () => {
    // Shockwave animation
    const newWave = Date.now();
    setWaves(prev => [...prev, newWave]);
    
    setTimeout(() => {
      setWaves(prev => prev.filter(w => w !== newWave));
    }, 1000);

    // Update count
    setCount(prev => prev + 1);
    
    // Show feedback
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  return (
    <Card className="missyou-area" style={{ gridColumn: '1 / -1' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {waves.map(wave => (
          <div
            key={wave}
            className="wave active"
            style={{
              width: '56px',
              height: '56px',
              left: 0,
              top: 0,
              position: 'absolute',
            }}
          />
        ))}
        <button id="wish-btn" onClick={handleWish} aria-label="Estoy pensando en ti">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="var(--rose-dim)"
              stroke="var(--rose)"
              strokeWidth="0.8"
            />
          </svg>
        </button>
      </div>
      <div className="missyou-text">
        <h3>¿Estás pensando en mí?</h3>
        <p id="wish-count">{count} pensamientos enviados</p>
      </div>
      <div id={`wish-feedback`} className={showFeedback ? 'show' : ''}>
        💗 yo también...
      </div>
    </Card>
  );
}