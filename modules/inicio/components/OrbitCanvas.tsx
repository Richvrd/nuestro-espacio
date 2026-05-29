'use client';

import { useEffect, useRef } from 'react';

export function OrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, t = 0;
    let animationId: number;

    function resize() {
      if (!canvas) return;
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(timestamp: number) {
      if (!ctx) return;
      animationId = requestAnimationFrame(draw);
      t = timestamp * 0.001;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const size = Math.min(W, H);
      const rx = size * 0.2;
      const ry = size * 0.2;

      // Faint orbit rings
      [[rx * 1.6, ry * 1.6, 0.03], [rx, ry, 0.07], [rx * 0.5, ry * 0.5, 0.04]].forEach(([rxi, ryi, a]) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rxi as number, ryi as number, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,169,110,${a})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      cg.addColorStop(0, 'rgba(201,169,110,0.12)');
      cg.addColorStop(1, 'rgba(201,169,110,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 3 + Math.sin(t) * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,169,110,0.4)';
      ctx.fill();

      // Star 1 (rose)
      const a1 = t * 0.3;
      const s1x = cx + Math.cos(a1) * rx;
      const s1y = cy + Math.sin(a1) * ry;
      for (let i = 0; i < 8; i++) {
        const ta = a1 - i * 0.15;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ta) * rx, cy + Math.sin(ta) * ry, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,117,106,${0.2 - i * 0.02})`;
        ctx.fill();
      }
      const g1 = ctx.createRadialGradient(s1x, s1y, 0, s1x, s1y, 18);
      g1.addColorStop(0, 'rgba(184,117,106,0.35)');
      g1.addColorStop(1, 'rgba(184,117,106,0)');
      ctx.beginPath();
      ctx.arc(s1x, s1y, 18, 0, Math.PI * 2);
      ctx.fillStyle = g1;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s1x, s1y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#b8756a';
      ctx.fill();

      // Star 2 (gold)
      const a2 = -t * 0.45 + Math.PI;
      const s2x = cx + Math.cos(a2) * rx;
      const s2y = cy + Math.sin(a2) * ry;
      for (let i = 0; i < 8; i++) {
        const ta = a2 + i * 0.15;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ta) * rx, cy + Math.sin(ta) * ry, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${0.2 - i * 0.02})`;
        ctx.fill();
      }
      const g2 = ctx.createRadialGradient(s2x, s2y, 0, s2x, s2y, 18);
      g2.addColorStop(0, 'rgba(201,169,110,0.35)');
      g2.addColorStop(1, 'rgba(201,169,110,0)');
      ctx.beginPath();
      ctx.arc(s2x, s2y, 18, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s2x, s2y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#c9a96e';
      ctx.fill();
    }

    draw(0);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas id="orbit-canvas" ref={canvasRef} />;
}