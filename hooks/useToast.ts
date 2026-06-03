'use client';

import { useContext } from 'react';
import { ToastContext, ToastContextValue } from '@/contexts/ToastContext';

export function useToast(): ToastContextValue['toast'] {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context.toast;
}
