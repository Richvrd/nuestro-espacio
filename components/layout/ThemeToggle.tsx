'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setIsLight(true);
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggle = () => {
    const newValue = !isLight;
    setIsLight(newValue);
    
    if (newValue) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button 
      className="btn btn-ghost" 
      onClick={toggle}
      style={{ padding: '0.5rem 0.8rem', fontSize: '0.65rem' }}
    >
      {isLight ? '☀️ claro' : '🌙 oscuro'}
    </button>
  );
}