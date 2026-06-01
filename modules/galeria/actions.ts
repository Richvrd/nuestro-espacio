'use server';

import { createClient } from '@/lib/supabase/server';
import { Photo, Album } from './types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function extractFilePath(url: string): string {
  const u = new URL(url);
  const parts = u.pathname.split('/');
  return parts[parts.length - 1];
}

// ─── fetch ───────────────────────────────────────────────────────────────────

export async function getGaleriaItems(): Promise<{ photos: Photo[]; albums: Album[] }> {
  const supabase = await createClient();

  const [{ data: photosData }, { data: albumsData }] = await Promise.all([
    supabase.from('photos').select('*').is('album_id', null).order('created_at', { ascending: false }),
    supabase.from('albums').select('*, photos(*)').order('created_at', { ascending: false }),
  ]);

  const photos: Photo[] = (photosData || []).map(p => ({ ...p, title: p.title || p.caption }));
  const albums: Album[] = (albumsData || []).map(a => ({
    id: a.id,
    title: a.title,
    caption: a.caption,
    created_at: a.created_at,
    photos: (a.photos || []).map((p: Photo) => ({ ...p, title: p.title || p.caption })),
  }));

  return { photos, albums };
}

// ─── insert foto (recibe URL ya subida desde el cliente) ──────────────────────

export async function insertPhoto(
  url: string, title: string, caption: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('photos').insert({
    url,
    title: title || url.split('/').pop()?.replace(/\.[^.]+$/, '') || 'foto',
    caption: caption || '',
    date: new Date().toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }),
    uploaded_by: 'user',
    album_id: null,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── insert álbum (recibe URLs ya subidas desde el cliente) ───────────────────

export async function insertAlbum(
  title: string,
  caption: string,
  photoUrls: { url: string; name: string }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: album, error: albumError } = await supabase
    .from('albums')
    .insert({ title, caption: caption || '' })
    .select()
    .single();

  if (albumError) return { success: false, error: albumError.message };

  const rows = photoUrls.map(({ url, name }) => ({
    url,
    title: name,
    caption: '',
    date: new Date().toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }),
    uploaded_by: 'user',
    album_id: album.id,
  }));

  const { error: insertError } = await supabase.from('photos').insert(rows);
  if (insertError) {
    await supabase.from('albums').delete().eq('id', album.id);
    return { success: false, error: insertError.message };
  }

  return { success: true };
}

// ─── edit ─────────────────────────────────────────────────────────────────────

export async function updatePhoto(
  id: string, title: string, caption: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('photos').update({ title, caption }).eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateAlbum(
  id: string, title: string, caption: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('albums').update({ title, caption }).eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}

// ─── delete ───────────────────────────────────────────────────────────────────

export async function deletePhoto(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: photo } = await supabase.from('photos').select('url, album_id').eq('id', id).single();

  if (photo?.url) {
    await supabase.storage.from('photos').remove([extractFilePath(photo.url)]);
  }

  const { error } = await supabase.from('photos').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  if (photo?.album_id) {
    const { count } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('album_id', photo.album_id);
    if (count === 0) {
      await supabase.from('albums').delete().eq('id', photo.album_id);
    }
  }

  return { success: true };
}

export async function deleteAlbum(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: photos } = await supabase.from('photos').select('url').eq('album_id', id);

  if (photos?.length) {
    const paths = photos.map(p => extractFilePath(p.url)).filter(Boolean);
    if (paths.length) await supabase.storage.from('photos').remove(paths);
  }

  await supabase.from('photos').delete().eq('album_id', id);
  const { error } = await supabase.from('albums').delete().eq('id', id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function toggleSpecialMomento(photoId: string, current: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('photos')
    .update({ is_special: !current })
    .eq('id', photoId);
  if (error) throw new Error(error.message);
}
