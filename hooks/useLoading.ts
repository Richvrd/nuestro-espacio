'use client';

import { useContext } from 'react';
import { LoadingContext, LoadingContextValue } from '@/contexts/LoadingContext';

export function useLoading(): LoadingContextValue['loading'] {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context.loading;
}
