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
    .select('id, subject, from_name, created_at')
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

function formatLetterDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  });
}

export default async function InicioPage() {
  const [stats, letters, capsules] = await Promise.all([
    getStats(),
    getRecentLetters(),
    getRecentCapsules(),
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
        <div className="home-grid">
          
          <StatCard icon="📸" value={stats.photos} label="fotos" />
          <StatCard icon="💌" value={stats.letters} label="cartas" />
          <StatCard icon="⏳" value={stats.capsules} label="cápsulas" />

          {stats.photos === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
              <EmptyState 
                icon="📸" 
                title="Aún no hay fotos" 
                subtitle="sean los primeros en subir un recuerdo" 
              />
              <Link href="/galeria" className="link-arrow" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
                ver galería →
              </Link>
            </div>
          ) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
              <div style={{ marginBottom: '1rem', fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                recientes
              </div>
              <Link href="/galeria" className="link-arrow" style={{ display: 'block', textAlign: 'right', marginTop: '1rem' }}>
                ver galería →
              </Link>
            </div>
          )}

          {letters.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
              <EmptyState 
                icon="💌" 
                title="Aún no hay cartas" 
                subtitle="escribe la primera carta" 
              />
              <Link href="/cartas" className="link-arrow" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
                leer todas →
              </Link>
            </div>
          ) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '1rem' }}>
              <div style={{ padding: '0.5rem 1rem', fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                últimas cartas
              </div>
              {letters.map(letter => (
                <div key={letter.id} className="letter-preview-item">
                  <div className="li-from">de {letter.from_name}</div>
                  <div className="li-subject">{letter.subject}</div>
                  <div className="li-date">{formatLetterDate(letter.created_at)}</div>
                </div>
              ))}
              <Link href="/cartas" className="link-arrow" style={{ display: 'block', textAlign: 'right', padding: '1rem', paddingTop: '0' }}>
                leer todas →
              </Link>
            </div>
          )}

          {capsules.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
              <EmptyState 
                icon="⏳" 
                title="Aún no hay cápsulas" 
                subtitle="crea la primera cápsula del tiempo" 
              />
              <Link href="/capsula" className="link-arrow" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
                ver todas →
              </Link>
            </div>
          ) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
              <Link href="/capsula" className="link-arrow" style={{ display: 'block', textAlign: 'center' }}>
                ver todas →
              </Link>
            </div>
          )}

          <WishButton />
        </div>
      </div>
    </div>
  );
}