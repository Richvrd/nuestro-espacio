'use client';

import { useState, useCallback } from 'react';
import type { Moment } from '../types';
import { getMoments, insertMoment, updateMoment, deleteMoment } from '../actions';

interface State {
  moments: Moment[];
  loading: boolean;
  saving: boolean;
}

export function useMoments(initial: Moment[]) {
  const [state, setState] = useState<State>({ moments: initial, loading: false, saving: false });

  const refresh = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    const data = await getMoments();
    setState(s => ({ ...s, moments: data, loading: false }));
  }, []);

  const create = useCallback(async (payload: Parameters<typeof insertMoment>[0]) => {
    setState(s => ({ ...s, saving: true }));
    const newMoment = await insertMoment(payload);
    setState(s => ({
      ...s,
      saving: false,
      moments: [...s.moments, newMoment].sort((a, b) => a.date.localeCompare(b.date)),
    }));
    return newMoment;
  }, []);

  const update = useCallback(async (id: string, payload: Parameters<typeof updateMoment>[1]) => {
    setState(s => ({ ...s, saving: true }));
    const updated = await updateMoment(id, payload);
    setState(s => ({
      ...s,
      saving: false,
      moments: s.moments
        .map(m => m.id === id ? updated : m)
        .sort((a, b) => a.date.localeCompare(b.date)),
    }));
  }, []);

  const remove = useCallback(async (id: string) => {
    setState(s => ({ ...s, moments: s.moments.filter(m => m.id !== id) }));
    await deleteMoment(id);
  }, []);

  return { ...state, refresh, create, update, remove };
}
