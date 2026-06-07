'use client';

import { ReactNode, useRef, useEffect, useState, useCallback } from 'react';
import AnniversaryEvent, { type AnniversaryEventHandle } from '@/modules/inicio/components/AnniversaryEvent';
import { checkAndClaimAnniversaryEvent } from '@/modules/inicio/actions/anniversaryActions';

interface PanelData {
  tag: string;
  ornament: string;
  label: string;
  message: string;
  content: ReactNode;
  link?: { href: string; text: string };
  leftExtra?: ReactNode;
}

interface InicioSectionsProps {
  hero: ReactNode;
  panels: PanelData[];
  currentUserName?: string;
}

export function InicioSections({ hero, panels, currentUserName }: InicioSectionsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anniversaryRef = useRef<AnniversaryEventHandle>(null);

  useEffect(() => {
    if (!currentUserName) return;
    checkAndClaimAnniversaryEvent(currentUserName).then(({ shouldFire }) => {
      if (shouldFire) {
        setTimeout(() => anniversaryRef.current?.trigger(), 800);
      }
    });
  }, [currentUserName]);

  const allPanels = panels.length;

  const scrollTo = useCallback((idx: number) => {
    const el = panelRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const observer = new IntersectionObserver(
      entries => {
        let maxRatio = 0;
        let maxIdx = -1;
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.panelIdx);
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            maxIdx = idx;
          }
        }
        if (maxIdx >= 0) {
          setActiveIdx(maxIdx);
          setRevealed(prev => {
            if (prev.has(maxIdx)) return prev;
            const next = new Set(prev);
            next.add(maxIdx);
            return next;
          });
        }
      },
      { root: wrap, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const ref of panelRefs.current) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, [allPanels]);

  return (
    <>
      <AnniversaryEvent ref={anniversaryRef} />
      <div className="inicio-scroll-wrap" ref={wrapRef}>
        {/* Panel 1 — Hero */}
        <div className="inicio-panel" data-panel-idx={0} ref={el => { panelRefs.current[0] = el; }}>
          {hero}
          <div className={`inicio-scroll-cue ${activeIdx === 0 ? '' : 'hidden'}`}>
            <span className="inicio-scroll-cue-label">desplázate</span>
            <div className="inicio-scroll-cue-line" />
          </div>
        </div>

        {/* Panels 2..N — content sections */}
        {panels.map((p, i) => {
          const idx = i + 1;
          const isRevealed = revealed.has(idx);
          return (
            <div className="inicio-panel" key={idx} data-panel-idx={idx}
              ref={el => { panelRefs.current[idx] = el; }}>
              <span className="inicio-section-tag">{p.tag}</span>
              <div className="inicio-panel-inner">
                <div className="inicio-panel-left">
                  <span className={`inicio-reveal ${isRevealed ? 'visible' : ''}`}
                    style={{ fontSize: '1.2rem', color: 'var(--gold)' }}>{p.ornament}</span>
                  <span className={`inicio-reveal ${isRevealed ? 'visible' : ''}`}
                    style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', letterSpacing: '0.3em',
                      textTransform: 'uppercase', color: 'var(--muted)' }}>{p.label}</span>
                  <p className={`inicio-reveal ${isRevealed ? 'visible' : ''}`}
                    style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontStyle: 'italic',
                      color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{p.message}</p>
                  {p.link && (
                    <a href={p.link.href}
                      className={`inicio-reveal ${isRevealed ? 'visible' : ''}`}
                      style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: '0.1em',
                        color: 'var(--gold)', marginTop: '0.5rem' }}>
                      {p.link.text} →
                    </a>
                  )}
                  {p.leftExtra && (
                    <div className={`inicio-reveal ${isRevealed ? 'visible' : ''}`}
                      style={{ marginTop: '0.5rem' }}>
                      {p.leftExtra}
                    </div>
                  )}
                </div>
                <div className="inicio-panel-right">
                  <div className={`inicio-reveal ${isRevealed ? 'visible' : ''}`}>
                    {p.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot navigation */}
      <nav className="inicio-dot-nav">
        {[0, ...panels.map((_, i) => i + 1)].map(idx => (
          <button key={idx} className={`inicio-dot ${activeIdx === idx ? 'active' : ''}`}
            onClick={() => scrollTo(idx)} aria-label={`Panel ${idx + 1}`} />
        ))}
      </nav>


    </>
  );
}
