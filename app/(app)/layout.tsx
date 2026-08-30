import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { StarField } from '@/components/shared/StarField';
import { ShootingStars } from '@/components/shared/ShootingStars';
import { SessionTimer } from '@/components/shared/SessionTimer';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StarField />
      <ShootingStars />
      <SessionTimer />
      <div id="app">
        <Sidebar />
        <main id="main">
          {children}
        </main>
      </div>
    </>
  );
}
