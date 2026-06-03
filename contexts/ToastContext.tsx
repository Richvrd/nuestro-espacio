'use client';

import { createContext, useState, useCallback, useRef, ReactNode } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  duration: number;
  exiting: boolean;
}

export interface ToastContextValue {
  toasts: Toast[];
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    dismiss: (id: string) => void;
  };
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const MAX_TOASTS = 4;
const EXIT_ANIMATION_MS = 350;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const startExit = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.set(id, setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timersRef.current.delete(id);
    }, EXIT_ANIMATION_MS));
  }, []);

  const addToast = useCallback((type: Toast['type'], message: string, duration = 4000) => {
    const id = crypto.randomUUID();
    setToasts(prev => {
      const next = [...prev, { id, type, message, duration, exiting: false }];
      if (next.length > MAX_TOASTS) {
        const removed = next.shift()!;
        const timer = timersRef.current.get(removed.id);
        if (timer) clearTimeout(timer);
        timersRef.current.delete(removed.id);
      }
      return next;
    });
    if (duration > 0) {
      timersRef.current.set(id, setTimeout(() => startExit(id), duration));
    }
  }, [startExit]);

  const dismiss = useCallback((id: string) => {
    startExit(id);
  }, [startExit]);

  const toast = {
    success: useCallback((message: string, duration?: number) => addToast('success', message, duration), [addToast]),
    error: useCallback((message: string, duration?: number) => addToast('error', message, duration), [addToast]),
    warning: useCallback((message: string, duration?: number) => addToast('warning', message, duration), [addToast]),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
    </ToastContext.Provider>
  );
}
