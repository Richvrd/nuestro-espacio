import { ReactNode } from 'react';
import { StarField } from '@/components/shared/StarField';
import { ShootingStars } from '@/components/shared/ShootingStars';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StarField />
      <ShootingStars />
      <div style={{ position: 'relative', zIndex: 1, height: '100vh', overflow: 'hidden' }}>
        {children}
      </div>
    </>
  );
}
