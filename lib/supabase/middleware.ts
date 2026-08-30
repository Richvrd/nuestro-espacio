import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { INACTIVITY_COOKIE, SESSION_TIMEOUT_MS } from '@/lib/constants';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname === '/login';

  if (!user) {
    // Sin sesión: limpiar marca de inactividad para evitar cierres espurios tras un nuevo login.
    supabaseResponse.cookies.delete(INACTIVITY_COOKIE);
    if (!isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/inicio';
    return NextResponse.redirect(url);
  }

  // Sesión activa: reforzar cierre por inactividad incluso sin JS corriendo.
  const now = Date.now();
  const lastRaw = request.cookies.get(INACTIVITY_COOKIE)?.value;
  const last = lastRaw ? Number(lastRaw) : NaN;

  if (!Number.isNaN(last) && now - last >= SESSION_TIMEOUT_MS) {
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) {
        supabaseResponse.cookies.delete(name);
      }
    });
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  supabaseResponse.cookies.set(INACTIVITY_COOKIE, String(now), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
  });

  return supabaseResponse;
}