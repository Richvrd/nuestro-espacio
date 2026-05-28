import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { StarField } from '@/components/shared/StarField';
import { ShootingStars } from '@/components/shared/ShootingStars';
import { ToastProvider } from '@/components/ui/Toast';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <StarField />
      <ShootingStars />
      <div id="app">
        <Sidebar />
        <main id="main">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}