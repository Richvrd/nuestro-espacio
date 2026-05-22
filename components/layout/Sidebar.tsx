'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { COUPLE, formatDate } from '@/lib/constants';
import { useCounter } from '@/hooks/useCounter';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { href: '/inicio', label: 'Inicio', icon: '✦', section: 'principal' },
  { href: '/galeria', label: 'Galería', icon: '📸', section: 'nuestro espacio' },
  { href: '/musica', label: 'Música', icon: '🎵', section: 'nuestro espacio' },
  { href: '/cartas', label: 'Cartas', icon: '💌', section: 'nuestro espacio', badge: '0' },
  { href: '/juegos', label: 'Juegos', icon: '🎮', section: 'extras' },
  { href: '/capsula', label: 'Cápsula', icon: '⏳', section: 'extras' },
];

function formatCounterMini(counter: { days: number; hours: number; minutes: number }) {
  return `${counter.days} d · ${counter.hours} h · ${counter.minutes} m`;
}

export function Sidebar() {
  const pathname = usePathname();
  const counter = useCounter();

  return (
    <aside id="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-couple">
          {COUPLE.name1} <em>&</em> {COUPLE.name2}
        </div>
        <div className="sidebar-since">
          desde {formatDate(COUPLE.startDate).split(',')[0].replace(' de ', ' ')}
        </div>
        <div className="sidebar-counter-mini">
          {formatCounterMini(counter)}
        </div>
      </div>

      <nav>
        {navItems.map((item, index) => {
          const showSection = index === 0 || navItems[index - 1].section !== item.section;
          
          return (
            <div key={item.href}>
              {showSection && (
                <div className="nav-section">{item.section}</div>
              )}
              <Link 
                href={item.href} 
                className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && Number(item.badge) > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <ThemeToggle />
        <div className="sidebar-status">
          <div className="status-dot"></div>
          <span>espacio privado</span>
        </div>
      </div>
    </aside>
  );
}