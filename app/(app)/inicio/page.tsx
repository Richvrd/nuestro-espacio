import { createClient } from '@/lib/supabase/server';
import { COUPLE, USER_EMAIL_MAP } from '@/lib/constants';
import { OrbitCanvas } from '@/modules/inicio/components/OrbitCanvas';
import { HeroCounter } from '@/modules/inicio/components/HeroCounter';
import { WishButton } from '@/modules/inicio/components/WishButton';
import { InicioSections } from './InicioSections';
import { MomentSkeleton, GaleriaSkeleton, CartasSkeleton, CapsulasSkeleton } from './skeletons';
import Link from 'next/link';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

async function getStats() {
  const supabase = await createClient();
  const [photosCount, lettersCount, capsulesCount, momentsCount] = await Promise.all([
    supabase.from('photos').select('id', { count: 'exact', head: true }),
    supabase.from('letters').select('id', { count: 'exact', head: true }),
    supabase.from('capsules').select('id', { count: 'exact', head: true }),
    supabase.from('moments').select('id', { count: 'exact', head: true }),
  ]);
  return {
    photos: photosCount.count || 0,
    letters: lettersCount.count || 0,
    capsules: capsulesCount.count || 0,
    moments: momentsCount.count || 0,
  };
}

async function getLatestMoment() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('moments')
    .select('id, title, emoji, date')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

async function getPhotos(limit = 7) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('photos')
    .select('id, url, caption, title, is_special, bg_gradient, emoji, date')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

async function getRecentLetters(limit = 3) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('letters')
    .select('id, subject, from_name, created_at, body')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

async function getRecentCapsules(limit = 2) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('capsules')
    .select('id, subject, to_name, open_date')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function MomentContent({ moment }: { moment: { emoji: string; title: string; date: string } | null }) {
  if (!moment) {
    return (
      <div className="inicio-empty-card">
        <span style={{ fontSize: '2.2rem' }}>✦</span>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--muted)' }}>
          Aún no hay momentos
        </p>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--muted)', letterSpacing: '0.15em' }}>
          El primer recuerdo que guardes aparecerá aquí
        </p>
      </div>
    );
  }
  return (
    <div className="inicio-moment-card">
      <div className="inicio-moment-emoji-box">{moment.emoji}</div>
      <div className="inicio-moment-info">
        <span className="inicio-moment-tag">Último momento</span>
        <span className="inicio-moment-title">{moment.title}</span>
        <span className="inicio-moment-date">{formatDate(moment.date)}</span>
      </div>
    </div>
  );
}

function GaleriaContent({ photos, stats }: { photos: any[]; stats: { photos: number; moments: number } }) {
  if (photos.length === 0) {
    return (
      <div className="inicio-empty-card">
        <span style={{ fontSize: '2.2rem' }}>📷</span>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--muted)' }}>
          Tu galería está esperando
        </p>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--muted)', letterSpacing: '0.15em' }}>
          Sube la primera foto juntos
        </p>
        <Link href="/galeria" className="inicio-card-link">ir a la galería →</Link>
      </div>
    );
  }

  const cells = [];
  const placeholdersNeeded = Math.max(0, 3 - photos.length);

  for (let i = 0; i < Math.min(photos.length, 3); i++) {
    const p = photos[i];
    cells.push(
      <div key={p.id} className={`foto-cell ${i === 0 ? 'tall' : ''}`}
        style={p.url ? {} : { background: p.bg_gradient || 'linear-gradient(135deg,#3a2b20,#261c14)' }}>
        {p.url ? <img src={p.url} alt={p.caption || ''} /> : <span style={{ fontSize: '1.5rem' }}>{p.emoji || '📷'}</span>}
        {p.caption && <div className="foto-cell-overlay">{p.caption}</div>}
      </div>
    );
  }

  for (let i = 0; i < placeholdersNeeded; i++) {
    cells.push(
      <div key={`ph-${i}`} className="foto-cell placeholder">
        <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>📷</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.45rem', color: 'var(--dimmed)' }}>próximamente</span>
      </div>
    );
  }

  return <div className="inicio-galeria-grid">{cells}</div>;
}

function getGaleriaStats(photos: any[], stats: { photos: number; moments: number }) {
  const specialCount = photos.filter(p => p.is_special).length;
  return (
    <div className="galeria-stats-row">
      <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--coral)' }}>{stats.photos}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--dimmed)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>fotos</span>
      {stats.moments > 0 && <><span className="stat-divider-vert" /><span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--rose)' }}>{stats.moments}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--dimmed)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>especiales</span></>}
    </div>
  );
}

function CartasContent({ letters }: { letters: any[] }) {
  if (letters.length === 0) {
    return (
      <div className="inicio-empty-card">
        <span style={{ fontSize: '2.2rem' }}>💌</span>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--muted)' }}>
          Todavía no hay cartas
        </p>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--muted)', letterSpacing: '0.15em' }}>
          Las palabras más bonitas están por escribirse
        </p>
        <Link href="/cartas" className="inicio-card-link">escribir la primera carta →</Link>
      </div>
    );
  }

  const items: ReactNode[] = letters.map(l => (
    <div key={l.id} className="inicio-letter-item">
      <div className="inicio-letter-icon">💌</div>
      <div className="inicio-letter-body">
        <span className="inicio-letter-from">Para {l.from_name}</span>
        <span className="inicio-letter-subject">{l.subject}</span>
      </div>
      <span className="inicio-letter-date">{formatDate(l.created_at)}</span>
    </div>
  ));

  const placeholdersNeeded = Math.max(0, 3 - letters.length);
  for (let i = 0; i < placeholdersNeeded; i++) {
    items.push(
      <Link key={`ph-${i}`} href="/cartas" className="inicio-letter-item placeholder">
        <div className="inicio-letter-icon">✍️</div>
        <div className="inicio-letter-body">
          <span className="inicio-letter-from">Escribe algo</span>
          <span className="inicio-letter-subject">El próximo capítulo os está esperando</span>
        </div>
      </Link>
    );
  }

  return <div className="inicio-letters-stack">{items}</div>;
}

function CapsulasContent({ capsules }: { capsules: any[] }) {
  if (capsules.length === 0) {
    const items = [
      { ornament: '🔒', title: 'Una carta para dentro de un año', sub: 'Cuéntale a tu yo futuro cómo te sientes hoy' },
      { ornament: '🔒', title: 'Guardad un recuerdo juntos', sub: 'El tiempo os devolverá algo precioso' },
    ];
    return (
      <div className="inicio-capsules-list">
        {items.map((item, i) => (
          <Link key={i} href="/capsula" className="inicio-capsule-card placeholder">
            <span style={{ fontSize: '1.5rem', opacity: 0.25, position: 'absolute', top: '0.5rem', right: '0.8rem' }}>{item.ornament}</span>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{item.title}</p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--muted)' }}>{item.sub}</p>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="inicio-capsules-list">
      {capsules.map(c => (
        <div key={c.id} className="inicio-capsule-card">
          <span className="inicio-capsule-ornament">⏳</span>
          <span className="inicio-capsule-meta">Para {c.to_name} · desde {c.from_name || 'nosotros'}</span>
          <span className="inicio-capsule-title">{c.subject}</span>
          <span className="inicio-capsule-date">se abre · {formatDate(c.open_date)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Async panel wrappers (each fetches its own data) ──────────── */

async function MomentPanel() {
  const moment = await getLatestMoment();
  return <MomentContent moment={moment} />;
}

async function GaleriaPanel() {
  const [photos, stats] = await Promise.all([
    getPhotos(7),
    getStats(),
  ]);
  return (
    <>
      {getGaleriaStats(photos.slice(0, 3), stats)}
      <GaleriaContent photos={photos} stats={stats} />
    </>
  );
}

async function CartasPanel() {
  const letters = await getRecentLetters(3);
  return <CartasContent letters={letters} />;
}

async function CapsulasPanel() {
  const capsules = await getRecentCapsules(2);
  return <CapsulasContent capsules={capsules} />;
}

/* ── Page ───────────────────────────────────────────────────────── */

export default async function InicioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserName = user?.email ? (USER_EMAIL_MAP[user.email] || user.email) : undefined;

  const hero = (
    <div className="home-hero">
      <OrbitCanvas />
      <div className="home-hero-content">
        <h1 className="home-title">
          {COUPLE.name1} <em>&</em> {COUPLE.name2}
        </h1>
        <p className="home-tagline">nuestro espacio · siempre</p>
        <HeroCounter />
      </div>
    </div>
  );

  const panels = [
    {
      tag: 'nuestra historia',
      ornament: '✦',
      label: 'Último momento',
      message: '"Cada momento contigo es un latido que el universo guarda."',
      content: <Suspense fallback={<MomentSkeleton />}><MomentPanel /></Suspense>,
      link: { href: '/momentos', text: 'registrar un momento' },
    },
    {
      tag: 'lo que hemos visto',
      ornament: '📸',
      label: 'Galería',
      message: '"Nuestros ojos guardan instantes que el tiempo no borra."',
      content: <Suspense fallback={<GaleriaSkeleton />}><GaleriaPanel /></Suspense>,
      link: { href: '/galeria', text: 'ver galería' },
    },
    {
      tag: 'palabras que quedan',
      ornament: '💌',
      label: 'Cartas',
      message: '"Algunas cosas solo se dicen con el corazón."',
      content: <Suspense fallback={<CartasSkeleton />}><CartasPanel /></Suspense>,
      link: { href: '/cartas', text: 'leer todas' },
    },
    {
      tag: 'el tiempo guarda',
      ornament: '⏳',
      label: 'Cápsulas del tiempo',
      message: '"El futuro nos espera, y lo guardamos aquí."',
      content: <Suspense fallback={<CapsulasSkeleton />}><CapsulasPanel /></Suspense>,
      link: { href: '/capsula', text: 'ver todas' },
      leftExtra: (
        <div className="inicio-wish-wrap">
          <p className="inicio-wish-text">Siempre hay un espacio para ti aquí 💗</p>
          <WishButton />
        </div>
      ),
    },
  ];

  return (
    <div id="page-home" className="page active">
      <InicioSections hero={hero} panels={panels} currentUserName={currentUserName} />
    </div>
  );
}
