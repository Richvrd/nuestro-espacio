export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({}, { status: 400 });

  const url = `${process.env.TMDB_BASE_URL}/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=es-ES&append_to_response=credits`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return Response.json({}, { status: 502 });

  const m = await res.json();

  return Response.json({
    tmdb_id:    m.id,
    title:      m.title,
    year:       m.release_date ? m.release_date.slice(0, 4) : null,
    poster_url: m.poster_path ? `${process.env.TMDB_IMAGE_URL}${m.poster_path}` : null,
    overview:   m.overview ?? null,
    genres:     (m.genres ?? []).map((g: any) => g.name),
    runtime:    m.runtime ?? null,
    director:   m.credits?.crew?.find((c: any) => c.job === 'Director')?.name ?? null,
    vote_avg:   m.vote_average ?? null,
  });
}
