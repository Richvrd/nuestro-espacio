export interface Photo {
  id: string;
  url: string | null;
  title: string;
  caption: string;
  date: string;
  uploaded_by: string;
  album_id: string | null;
  created_at: string;
  emoji?: string;
  bg_gradient?: string;
}

export interface Album {
  id: string;
  title: string;
  caption: string;
  created_at: string;
  photos: Photo[];
}

export type GaleriaItem =
  | { type: 'photo'; data: Photo }
  | { type: 'album'; data: Album };
