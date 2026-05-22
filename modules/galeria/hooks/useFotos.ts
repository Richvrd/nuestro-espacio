'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Photo, Album } from '../types';
import {
  getGaleriaItems,
  insertPhoto,
  insertAlbum,
  updatePhoto as updatePhotoAction,
  updateAlbum as updateAlbumAction,
  deletePhoto as deletePhotoAction,
  deleteAlbum as deleteAlbumAction,
} from '../actions';

// Sube un archivo al Storage de Supabase desde el browser
async function uploadToStorage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const { error } = await supabase.storage.from('photos').upload(name, file);
  if (error) throw new Error(error.message);
  return supabase.storage.from('photos').getPublicUrl(name).data.publicUrl;
}

export function useFotos(initialPhotos: Photo[], initialAlbums: Album[]) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { photos: p, albums: a } = await getGaleriaItems();
    setPhotos(p);
    setAlbums(a);
    setLoading(false);
  }, []);

  const uploadFoto = useCallback(async (file: File, title: string, caption: string) => {
    try {
      const url = await uploadToStorage(file);
      const result = await insertPhoto(url, title, caption);
      if (result.success) await refresh();
      return result;
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Error al subir' };
    }
  }, [refresh]);

  const uploadAlbum = useCallback(async (files: File[], title: string, caption: string) => {
    try {
      // Subir todos los archivos en paralelo desde el browser
      const uploaded = await Promise.all(
        files.map(async (file) => ({
          url: await uploadToStorage(file),
          name: file.name.replace(/\.[^.]+$/, ''),
        }))
      );
      const result = await insertAlbum(title, caption, uploaded);
      if (result.success) await refresh();
      return result;
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Error al subir' };
    }
  }, [refresh]);

  const editFoto = useCallback(async (id: string, title: string, caption: string) => {
    const result = await updatePhotoAction(id, title, caption);
    if (result.success) {
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, title, caption } : p));
      setAlbums(prev => prev.map(a => ({
        ...a,
        photos: a.photos.map(p => p.id === id ? { ...p, title, caption } : p),
      })));
    }
    return result;
  }, []);

  const editAlbum = useCallback(async (id: string, title: string, caption: string) => {
    const result = await updateAlbumAction(id, title, caption);
    if (result.success) {
      setAlbums(prev => prev.map(a => a.id === id ? { ...a, title, caption } : a));
    }
    return result;
  }, []);

  const deleteFoto = useCallback(async (id: string) => {
    const result = await deletePhotoAction(id);
    if (result.success) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      setAlbums(prev =>
        prev
          .map(a => ({ ...a, photos: a.photos.filter(p => p.id !== id) }))
          .filter(a => a.photos.length > 0)
      );
    }
    return result;
  }, []);

  const deleteAlbum = useCallback(async (id: string) => {
    const result = await deleteAlbumAction(id);
    if (result.success) setAlbums(prev => prev.filter(a => a.id !== id));
    return result;
  }, []);

  return {
    photos, albums, loading,
    refresh, uploadFoto, uploadAlbum,
    editFoto, editAlbum, deleteFoto, deleteAlbum,
  };
}
