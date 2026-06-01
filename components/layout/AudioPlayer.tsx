'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [started, setStarted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (started) return;
    const handler = () => {
      if (!started && audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
        setPlaying(true);
        setStarted(true);
      }
    };
    document.addEventListener('click', handler, { once: true });
    return () => document.removeEventListener('click', handler);
  }, [started, volume]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => el.load());
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value;
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const restart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        setPlaying(true);
      }
    }
  }, []);

  const playerContent = (
    <div className={`ap-inner ${mobileOpen ? 'open' : ''}`}>
      <div className="ap-row-top">
        <span className="ap-track-label">♪ canción de fondo</span>
      </div>
      <div className="ap-controls">
        <button className="ap-btn ap-skip" onClick={restart} title="Reiniciar">
          ⏮
        </button>
        <button className="ap-btn ap-play" onClick={toggle} title={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? '⏸' : '▶'}
        </button>
        <button className="ap-btn ap-skip" title="Siguiente (próximamente)" style={{ opacity: 0.4 }}>
          ⏭
        </button>
      </div>
      <div className="ap-volume-row">
        <span className="ap-vol-icon">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
        <input type="range" className="ap-vol-slider" min="0" max="1" step="0.05"
          value={volume} onChange={handleVolume} />
      </div>
    </div>
  );

  return (
    <>
      <audio ref={audioRef} src="/audio/cancion.mp3" loop
        onEnded={() => setPlaying(false)} />

      {/* Desktop: player integrado en sidebar */}
      <div className="audio-player" onClick={e => e.stopPropagation()}>
        {playerContent}
      </div>

      {/* Mobile: círculo flotante que expande el player */}
      <button className="ap-mobile-trigger" onClick={() => setMobileOpen(o => !o)}
        aria-label="Reproductor de música">
        {playing ? '♪' : '♩'}
      </button>
      <div className={`ap-mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}>
        <div className="ap-mobile-panel" onClick={e => e.stopPropagation()}>
          <button className="ap-mobile-close" onClick={() => setMobileOpen(false)}>✕</button>
          {playerContent}
        </div>
      </div>
    </>
  );
}
