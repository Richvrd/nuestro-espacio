'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(sec: number): string {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

function parseTrack(name: string): { title: string; artist: string } {
  const cleaned = stripExt(name);
  const idx = cleaned.indexOf(' - ');
  if (idx > 0) {
    return { title: cleaned.slice(0, idx).trim(), artist: cleaned.slice(idx + 3).trim() };
  }
  return { title: cleaned, artist: '' };
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [scrollDist, setScrollDist] = useState(0);

  const currentSrc = playlist.length > 0 ? `/audio/${playlist[currentIdx]}` : null;

  useEffect(() => {
    fetch('/api/audios')
      .then(r => r.json())
      .then(data => {
        const files = data.files as string[];
        if (files.length > 0) {
          setPlaylist(shuffle(files));
          setCurrentIdx(0);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => { setCurrentTime(el.currentTime); setDuration(el.duration || 0); };
    const onMeta = () => { setDuration(el.duration || 0); };
    const onEnd = () => { next(); };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnd);
    };
  }, [currentIdx, playlist]);

  useEffect(() => {
    if (playing && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentIdx]);

  useEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const timer = requestAnimationFrame(() => {
      if (el.scrollWidth > el.clientWidth) {
        setScrollDist(el.scrollWidth - el.clientWidth);
      } else {
        setScrollDist(0);
      }
    });
    return () => cancelAnimationFrame(timer);
  }, [currentIdx, currentSrc]);

  useEffect(() => {
    const el = labelRef.current;
    if (!el || scrollDist <= 0) return;

    const CYCLE = 12000;
    const PAUSE_S = 2000;
    const SCROLL_F = 3000;
    const PAUSE_E = 3000;
    const SCROLL_B = 3000;

    let start = performance.now();
    let id: number;

    function ease(t: number): number {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function tick(now: number) {
      const e = (now - start) % CYCLE;
      let p: number;
      if (e < PAUSE_S) {
        p = 0;
      } else if (e < PAUSE_S + SCROLL_F) {
        p = ease((e - PAUSE_S) / SCROLL_F);
      } else if (e < PAUSE_S + SCROLL_F + PAUSE_E) {
        p = 1;
      } else {
        p = 1 - ease(Math.min((e - PAUSE_S - SCROLL_F - PAUSE_E) / SCROLL_B, 1));
      }
      el!.style.transform = `translateX(${-p * scrollDist}px)`;
      id = requestAnimationFrame(tick);
    }

    id = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(id); if (el) el.style.transform = ''; };
  }, [scrollDist]);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    playing ? pause() : play();
  }, [playing, play, pause]);

  const next = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIdx(i => (i + 1) % playlist.length);
    setPlaying(true);
  }, [playlist]);

  const prev = useCallback(() => {
    if (playlist.length === 0) return;
    const el = audioRef.current;
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      return;
    }
    setCurrentIdx(i => (i - 1 + playlist.length) % playlist.length);
    setPlaying(true);
  }, [playlist]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value;
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = +e.target.value;
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  }, []);

  const playerContent = (
    <div className={`ap-inner ${mobileOpen ? 'open' : ''}`}>
      <div className="ap-track-info">
        {(() => {
          const { title, artist } = currentSrc ? parseTrack(playlist[currentIdx]) : { title: '—', artist: '' };
          return (
            <span className="ap-track-label" ref={labelRef}
              title={currentSrc || ''}>
              <span className="ap-track-title">{title}</span>
              {artist && <span className="ap-track-artist"> — {artist}</span>}
            </span>
          );
        })()}
        {playlist.length > 1 && (
          <span className="ap-track-count">{currentIdx + 1}/{playlist.length}</span>
        )}
      </div>

      <div className="ap-progress-row">
        <span className="ap-time">{fmt(currentTime)}</span>
        <input type="range" className="ap-seek" min="0" max={duration || 0} step="0.1"
          value={currentTime} onChange={handleSeek} />
        <span className="ap-time">{fmt(duration)}</span>
      </div>

      <div className="ap-controls">
        <button className="ap-btn" onClick={prev} title="Anterior">⏮</button>
        <button className="ap-btn ap-play" onClick={toggle} title={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? '⏸' : '▶'}
        </button>
        <button className="ap-btn" onClick={next} title="Siguiente">⏭</button>
      </div>

      <div className="ap-volume-row">
        <span className="ap-vol-icon">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
        <input type="range" className="ap-vol-slider" min="0" max="1" step="0.05"
          value={volume} onChange={handleVolume} />
      </div>

      {!loaded && <div className="ap-loading">Cargando lista...</div>}
      {loaded && playlist.length === 0 && <div className="ap-loading">Sin canciones aún</div>}
    </div>
  );

  return (
    <>
      {currentSrc && (
        <audio ref={audioRef} src={currentSrc}
          onError={e => {
            const el = e.currentTarget;
            el.load();
            if (playlist.length > 0) next();
          }} />
      )}

      <div className="audio-player" onClick={e => e.stopPropagation()}>
        {playerContent}
      </div>

      <button className="ap-mobile-trigger" onClick={() => setMobileOpen(o => !o)}
        aria-label="Reproductor de música">
        {playing ? '🎶' : '🎶'}
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
