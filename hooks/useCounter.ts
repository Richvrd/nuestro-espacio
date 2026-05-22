'use client';

import { useState, useEffect } from 'react';
import { COUPLE } from '@/lib/constants';

interface Counter {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCounter() {
  const [counter, setCounter] = useState<Counter>({
    years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    const updateCounter = () => {
      const now = new Date();
      const start = COUPLE.startDate;

      // Calcular años y meses completos usando fechas calendario
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();

      if (months < 0) {
        years--;
        months += 12;
      }

      // Ajustar si todavía no llegamos al día exacto en este mes
      const tempAnchor = new Date(start);
      tempAnchor.setFullYear(tempAnchor.getFullYear() + years);
      tempAnchor.setMonth(tempAnchor.getMonth() + months);
      if (now < tempAnchor) {
        months--;
        if (months < 0) {
          years--;
          months += 12;
        }
      }

      // Ancla: punto exacto tras restar años y meses completos
      const anchor = new Date(start);
      anchor.setFullYear(anchor.getFullYear() + years);
      anchor.setMonth(anchor.getMonth() + months);

      const remainingMs = now.getTime() - anchor.getTime();

      const totalSeconds = Math.floor(remainingMs / 1000);
      const weeks   = Math.floor(totalSeconds / (7 * 24 * 3600));
      const days    = Math.floor((totalSeconds % (7 * 24 * 3600)) / (24 * 3600));
      const hours   = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setCounter({ years, months, weeks, days, hours, minutes, seconds });
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, []);

  return counter;
}
