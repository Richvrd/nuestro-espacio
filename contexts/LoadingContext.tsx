'use client';

import { createContext, useState, useCallback, ReactNode } from 'react';

export interface LoadingContextValue {
  loading: {
    show: (message?: string) => void;
    hide: () => void;
  };
  isLoading: boolean;
  loadingMessage: string;
}

export const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ active: boolean; message: string }>({
    active: false,
    message: '',
  });

  const show = useCallback((message?: string) => {
    setState({ active: true, message: message || 'Cargando...' });
  }, []);

  const hide = useCallback(() => {
    setState({ active: false, message: '' });
  }, []);

  return (
    <LoadingContext.Provider value={{ loading: { show, hide }, isLoading: state.active, loadingMessage: state.message }}>
      {children}
    </LoadingContext.Provider>
  );
}
