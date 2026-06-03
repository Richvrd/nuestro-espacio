export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 2) return Response.json({ results: [] });

  const url = `${process.env.TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(q)}&api_key=${process.env.TMDB_API_KEY}&language=es-ES&include_adult=false&page=1`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return Response.json({ results: [] }, { status: 502 });

  const data = await res.json();

  const results = (data.results ?? []).slice(0, 8).map((m: any) => ({
    tmdb_id:    m.id,
    title:      m.title,
    year:       m.release_date ? m.release_date.slice(0, 4) : null,
    poster_url: m.poster_path ? `${process.env.TMDB_IMAGE_URL}${m.poster_path}` : null,
    overview:   m.overview ?? null,
    vote_avg:   m.vote_average ?? null,
  }));

  return Response.json({ results });
}
