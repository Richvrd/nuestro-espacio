'use client';

import { useState, useCallback } from 'react';
import type { Capsule } from '../types';
import {
  getCapsulas,
  insertCapsula,
  sendToSpace,
  restoreCapsula,
} from '../actions';

interface State {
  capsulas: Capsule[];
  loading: boolean;
  saving: boolean;
}

export function useCapsulas(initial: Capsule[]) {
  const [state, setState] = useState<State>({
    capsulas: initial,
    loading: false,
    saving: false,
  });

  const refresh = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    const data = await getCapsulas();
    setState(s => ({ ...s, capsulas: data, loading: false }));
  }, []);

  const createCapsula = useCallback(async (
    subject: string, to_name: string, body: string, open_date: string
  ) => {
    setState(s => ({ ...s, saving: true }));
    const newCap = await insertCapsula(subject, to_name, body, open_date);
    setState(s => ({ ...s, capsulas: [newCap, ...s.capsulas], saving: false }));
  }, []);

  const enviarAlEspacio = useCallback(async (id: string) => {
    setState(s => ({ ...s, capsulas: s.capsulas.filter(c => c.id !== id) }));
    await sendToSpace(id);
  }, []);

  const restaurar = useCallback(async (id: string) => {
    await restoreCapsula(id);
    await refresh();
  }, [refresh]);

  return { ...state, refresh, createCapsula, enviarAlEspacio, restaurar };
}
