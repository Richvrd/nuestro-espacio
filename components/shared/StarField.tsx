'use client';

import { useEffect, useState } from 'react';

interface Star {
  left: string;
  top: string;
  width: string;
  height: string;
  animationDuration: string;
  animationDelay: string;
  opacityLow: string;
  opacityHigh: string;
}

export function StarField() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars: Star[] = Array.from({ length: 140 }, (_, i) => {
      const isLarge = Math.random() < 0.2;
      const highOpacity = 0.1 + Math.random() * 0.5;
      
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: isLarge ? '1.8px' : '1px',
        height: isLarge ? '1.8px' : '1px',
        animationDuration: `${3 + Math.random() * 6}s`,
        animationDelay: `-${Math.random() * 8}s`,
        opacityLow: `${highOpacity * 0.15}`,
        opacityHigh: `${highOpacity}`,
      };
    });
    
    setStars(generatedStars);
  }, []);

  return (
    <div id="starfield">
      {stars.map((star, i) => (
        <div
          key={i}
          className="s"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            height: star.height,
            '--d': star.animationDuration,
            '--dl': star.animationDelay,
            '--lo': star.opacityLow,
            '--hi': star.opacityHigh,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}