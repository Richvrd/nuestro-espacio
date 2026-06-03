import { Suspense } from 'react';
import { getMovies } from '@/modules/peliculas/actions';
import { PeliculasApp } from '@/modules/peliculas/components/PeliculasApp';
import { PeliculasSkeleton } from '@/modules/peliculas/components/PeliculasSkeleton';
import { createClient } from '@/lib/supabase/server';
import { USER_EMAIL_MAP, COUPLE } from '@/lib/constants';

async function PeliculasContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;
  const currentUserName = email ? (USER_EMAIL_MAP[email] ?? COUPLE.name2) : COUPLE.name2;

  const movies = await getMovies();
  return <PeliculasApp initialMovies={movies} currentUserName={currentUserName} />;
}

export default function PeliculasPage() {
  return (
    <div className="page active" style={{ padding: 0 }}>
      <Suspense fallback={<PeliculasSkeleton />}>
        <PeliculasContent />
      </Suspense>
    </div>
  );
}
