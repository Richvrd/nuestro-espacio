import { createClient } from '@/lib/supabase/server';
import { COUPLE } from '@/lib/constants';
import { OrbitCanvas } from '@/modules/inicio/components/OrbitCanvas';
import { HeroCounter } from '@/modules/inicio/components/HeroCounter';
import { StatCard } from '@/modules/inicio/components/StatCard';
import { WishButton } from '@/modules/inicio/components/WishButton';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

async function getStats() {
  const supabase = await createClient();
  
  const [photosCount, lettersCount, capsulesCount] = await Promise.all([
    supabase.from('photos').select('id', { count: 'exact', head: true }),
    supabase.from('letters').select('id', { count: 'exact', head: true }),
    supabase.from('capsules').select('id', { count: 'exact', head: true }),
  ]);

  return {
    photos: photosCount.count || 0,
    letters: lettersCount.count || 0,
    capsules: capsulesCount.count || 0,
  };
}

async function getRecentLetters() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('letters')
    .select('id, subject, from_name, created_at, body')
    .order('created_at', { ascending: false })
    .limit(3);
  
  return data || [];
}

async function getRecentCapsules() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('capsules')
    .select('id, subject, to_name, open_date')
    .order('created_at', { ascending: false })
    .limit(2);
  
  return data || [];
}

async function getLatestPhoto() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('photos')
    .select('id, url, caption, title')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  return data;
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

function formatLetterDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  });
}

export default async function InicioPage() {
  const [stats, letters, capsules, latestPhoto, latestMoment] = await Promise.all([
    getStats(),
    getRecentLetters(),
    getRecentCapsules(),
    getLatestPhoto(),
    getLatestMoment(),
  ]);

  return (
    <div id="page-home" className="page active">
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

      <div className="home-body">
        <div className="home-dashboard">

          <div className="hd-stats">
            <StatCard icon="📸" value={stats.photos} label="fotos" />
            <StatCard icon="💌" value={stats.letters} label="cartas" />
            <StatCard icon="⏳" value={stats.capsules} label="cápsulas" />
            {latestMoment && (
              <div className="hd-moment-badge">
                <span className="hd-moment-emoji">{latestMoment.emoji}</span>
                <div className="hd-moment-info">
                  <span className="hd-moment-label">último momento</span>
                  <span className="hd-moment-title">{latestMoment.title}</span>
                </div>
              </div>
            )}
          </div>

          <WishButton />

          <div className="hd-letters-card card">
            <div className="hd-section-header">
              <span className="hd-section-label">últimas cartas</span>
              <Link href="/cartas" className="link-arrow">ver todas →</Link>
            </div>
            {letters.length === 0 ? (
              <EmptyState icon="💌" title="Aún no hay cartas" subtitle="escribe la primera carta" />
            ) : (
              <>
                {letters.map(letter => (
                  <div key={letter.id} className="letter-preview-item">
                    <div className="li-from">de {letter.from_name}</div>
                    <div className="li-subject">{letter.subject}</div>
                    <div className="li-date">{formatLetterDate(letter.created_at)}</div>
                  </div>
                ))}
              </>
            )}
          </div>

          {latestPhoto && (
            <div className="hd-photo-card">
              <div className="hd-photo-frame">
                <img src={latestPhoto.url} alt={latestPhoto.caption || ''} />
              </div>
              {latestPhoto.caption && (
                <div className="hd-photo-caption">{latestPhoto.caption}</div>
              )}
            </div>
          )}

          <div className="hd-capsules-card card">
            <div className="hd-section-header">
              <span className="hd-section-label">cápsulas</span>
              <Link href="/capsula" className="link-arrow">ver todas →</Link>
            </div>
            {capsules.length === 0 ? (
              <EmptyState icon="⏳" title="Aún no hay cápsulas" subtitle="crea la primera cápsula del tiempo" />
            ) : (
              capsules.map(cap => (
                <div key={cap.id} className="hd-capsule-item">
                  <span className="hd-capsule-subject">{cap.subject}</span>
                  <span className="hd-capsule-meta">para {cap.to_name}</span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
