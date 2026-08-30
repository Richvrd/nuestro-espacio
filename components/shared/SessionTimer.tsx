'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointerdown'] as const;
const PASSIVE_EVENTS = new Set(['mousemove', 'scroll']);

export function SessionTimer() {
  const router = useRouter();
  const toast = useToast();
  const lastActivity = useRef<number | null>(null);
  const warningShown = useRef(false);
  const loggingOut = useRef(false);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(SESSION_WARNING_MS / 1000));

  const reset = useCallback(() => {
    lastActivity.current = Date.now();
    warningShown.current = false;
    setShowWarning(false);
  }, []);

  const logout = useCallback(async () => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // incluso si falla, se fuerza la navegación
    }
    toast.success('Tu sesión expiró por inactividad', 6000);
    router.push('/login');
  }, [router, toast]);

  useEffect(() => {
    lastActivity.current = Date.now();
    function onActivity(e: Event) {
      if (warningShown.current && PASSIVE_EVENTS.has(e.type)) return;
      reset();
    }
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, onActivity, { passive: true })
    );
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, [reset]);

  useEffect(() => {
    const interval = setInterval(() => {
      const base = lastActivity.current ?? Date.now();
      const elapsed = Date.now() - base;
      if (elapsed >= SESSION_TIMEOUT_MS) {
        logout();
        return;
      }
      const remaining = SESSION_TIMEOUT_MS - elapsed;
      if (remaining <= SESSION_WARNING_MS) {
        if (!warningShown.current) {
          warningShown.current = true;
          setShowWarning(true);
        }
        setSecondsLeft(Math.max(1, Math.ceil(remaining / 1000)));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [logout]);

  if (!showWarning) return null;

  return (
    <div className="session-backdrop" role="dialog" aria-modal="true" aria-labelledby="session-title">
      <div className="session-modal">
        <div className="session-icon">☄️</div>
        <h3 id="session-title">¿Sigues aquí?</h3>
        <p>
          Tu sesión expirará en <strong>{secondsLeft}s</strong> por inactividad.
        </p>
        <div className="session-actions">
          <button className="session-btn session-btn--primary" onClick={reset}>
            Seguir aquí
          </button>
          <button className="session-btn session-btn--ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}