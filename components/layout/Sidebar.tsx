'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { COUPLE, formatDate } from '@/lib/constants';
import { AudioPlayer } from './AudioPlayer';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  section: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/inicio', label: 'Inicio', icon: '✦', section: 'principal' },
  { href: '/galeria', label: 'Galería', icon: '📸', section: 'nuestro espacio' },
  { href: '/cartas', label: 'Cartas', icon: '💌', section: 'nuestro espacio', badge: '0' },
  { href: '/linea-de-tiempo', label: 'Línea de Tiempo', icon: '🪐', section: 'nuestro espacio' },
  { href: '/capsula', label: 'Cápsula', icon: '⏳', section: 'extras' },
  { href: '/peliculas', label: 'Peliculas', icon: '🎬', section: 'extras' },
];

// Items hidden from the mobile bottom bar (shown inside the toggle menu instead)
const mobileHiddenHrefs = new Set(['/linea-de-tiempo', '/peliculas']);

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  async function handleLogout() {
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        toggleRef.current && !toggleRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }
  }, [menuOpen]);

  function renderNavItem(item: NavItem, isSecondary = false) {
    const active = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`nav-item${isSecondary ? ' nav-item--secondary' : ''}${active ? ' active' : ''}`}
        onClick={() => setMenuOpen(false)}
      >
        <span className="nav-icon">{item.icon}</span>
        <span>{item.label}</span>
        {item.badge && Number(item.badge) > 0 && (
          <span className="nav-badge">{item.badge}</span>
        )}
      </Link>
    );
  }

  return (
    <aside id="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-couple">
          {COUPLE.name1} <em>&</em> {COUPLE.name2}
        </div>
        <div className="sidebar-since">
          desde {formatDate(COUPLE.startDate).split(',')[0].replace(' de ', ' ')}
        </div>
        <div className="sidebar-subtitle">Nuestro Espacio</div>
      </div>

      <nav>
        {navItems.map((item, index) => {
          const showSection = index === 0 || navItems[index - 1].section !== item.section;
          const isMobileHidden = mobileHiddenHrefs.has(item.href);
          return (
            <div key={item.href} className={isMobileHidden ? 'nav-item-wrap--mobile-hide' : 'nav-item-wrap'}>
              {showSection && (
                <div className="nav-section">{item.section}</div>
              )}
              {renderNavItem(item)}
            </div>
          );
        })}

        <div className="nav-item-wrap nav-mobile-toggle-wrap">
          <button className={`nav-mobile-toggle${menuOpen ? ' open' : ''}`} ref={toggleRef} onClick={() => setMenuOpen(o => !o)}
            aria-label="Más opciones">
            <span className="nav-icon">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </nav>

      <div className={`nav-secondary-popup ${menuOpen ? 'open' : ''}`} ref={menuRef}>
        <div className="nav-secondary-popup-inner">
          {navItems.filter(i => mobileHiddenHrefs.has(i.href)).map(i => renderNavItem(i, true))}
          <button className="nav-item nav-item--secondary nav-item--logout" onClick={handleLogout}>
            <span className="nav-icon">🌍</span>
            <span>Volver a la Tierra</span>
          </button>
        </div>
      </div>

      <AudioPlayer />

      <div className="sidebar-bottom">
        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="sidebar-logout-icon">🚀🌍</span>
          <span>Volver a la Tierra</span>
        </button>
      </div>
    </aside>
  );
}