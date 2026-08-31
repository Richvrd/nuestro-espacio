'use client';

import { useEffect, useRef } from 'react';

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y - s * 0.3, x - s, y - s * 0.3, x - s, y + s * 0.1);
  ctx.bezierCurveTo(x - s, y + s * 0.6, x, y + s, x, y + s);
  ctx.bezierCurveTo(x, y + s, x + s, y + s * 0.6, x + s, y + s * 0.1);
  ctx.bezierCurveTo(x + s, y - s * 0.3, x, y - s * 0.3, x, y + s * 0.3);
  ctx.closePath();
}

export function OrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eventModeRef = useRef(false);
  const transitionAlphaRef = useRef(0);
  const transitionStartRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, t = 0;
    let orbitCx = 0, orbitCy = 0, orbitSize = 0;
    let animationId: number;

    function resize() {
      if (!canvas) return;
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      const parent = canvas.parentElement;
      if (parent) {
        const pr = parent.getBoundingClientRect();
        const cr = canvas.getBoundingClientRect();
        orbitCx = (pr.left - cr.left) + pr.width / 2;
        orbitCy = (pr.top - cr.top) + pr.height / 2;
        orbitSize = Math.min(pr.width, pr.height);
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function handleHeartMode(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.active) {
        eventModeRef.current = true;
        transitionAlphaRef.current = 1;
      } else {
        eventModeRef.current = false;
        transitionStartRef.current = performance.now();
      }
    }

    window.addEventListener('celebracion:heart-mode', handleHeartMode);

    function draw(timestamp: number) {
      if (!ctx) return;
      animationId = requestAnimationFrame(draw);
      t = timestamp * 0.001;
      ctx.clearRect(0, 0, W, H);

      const cx = orbitCx || W / 2;
      const cy = orbitCy || H / 2;
      const size = orbitSize || Math.min(W, H);
      const orbitScale = size < 600 ? 0.45 : 0.35;
      const rx = size * orbitScale;
      const ry = size * orbitScale;

      // Transition handling
      if (!eventModeRef.current && transitionStartRef.current > 0) {
        const elapsed = performance.now() - transitionStartRef.current;
        transitionAlphaRef.current = Math.max(0, 1 - elapsed / 800);
        if (transitionAlphaRef.current <= 0) {
          transitionStartRef.current = 0;
        }
      }

      const alpha = eventModeRef.current ? 1 : transitionAlphaRef.current;

      if (alpha <= 0) {
        // Draw normal mode
        drawNormal(ctx, cx, cy, rx, ry, t);
        return;
      }

      if (alpha < 1 && !eventModeRef.current) {
        // Blend: draw heart mode under normal with alpha
        drawHeartMode(ctx, cx, cy, rx, ry, t, timestamp);
        ctx.globalAlpha = 1 - alpha;
        drawNormal(ctx, cx, cy, rx, ry, t);
        ctx.globalAlpha = 1;
        return;
      }

      drawHeartMode(ctx, cx, cy, rx, ry, t, timestamp);
    }

    draw(0);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('celebracion:heart-mode', handleHeartMode);
    };
  }, []);

  return <canvas id="orbit-canvas" ref={canvasRef} />;
}

function drawNormal(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, t: number) {
  // Faint orbit rings
  [[rx * 1.6, ry * 1.6, 0.03], [rx, ry, 0.07], [rx * 0.5, ry * 0.5, 0.04]].forEach(([rxi, ryi, a]) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rxi as number, ryi as number, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(167,139,250,${a})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Center glow
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
  cg.addColorStop(0, 'rgba(167,139,250,0.12)');
  cg.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(167,139,250,0.5)';
  ctx.fill();

  // Star 1 (rose)
  const a1 = t * 0.3;
  const s1x = cx + Math.cos(a1) * rx;
  const s1y = cy + Math.sin(a1) * ry;
  for (let i = 0; i < 8; i++) {
    const ta = a1 - i * 0.15;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(ta) * rx, cy + Math.sin(ta) * ry, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(244,114,182,${0.2 - i * 0.02})`;
    ctx.fill();
  }
  const g1 = ctx.createRadialGradient(s1x, s1y, 0, s1x, s1y, 18);
  g1.addColorStop(0, 'rgba(244,114,182,0.35)');
  g1.addColorStop(1, 'rgba(244,114,182,0)');
  ctx.beginPath();
  ctx.arc(s1x, s1y, 18, 0, Math.PI * 2);
  ctx.fillStyle = g1;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s1x, s1y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#f472b6';
  ctx.fill();

  // Star 2 (gold)
  const a2 = -t * 0.45 + Math.PI;
  const s2x = cx + Math.cos(a2) * rx;
  const s2y = cy + Math.sin(a2) * ry;
  for (let i = 0; i < 8; i++) {
    const ta = a2 + i * 0.15;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(ta) * rx, cy + Math.sin(ta) * ry, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(167,139,250,${0.2 - i * 0.02})`;
    ctx.fill();
  }
  const g2 = ctx.createRadialGradient(s2x, s2y, 0, s2x, s2y, 18);
  g2.addColorStop(0, 'rgba(167,139,250,0.35)');
  g2.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.beginPath();
  ctx.arc(s2x, s2y, 18, 0, Math.PI * 2);
  ctx.fillStyle = g2;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s2x, s2y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#a78bfa';
  ctx.fill();
}

function drawHeartMode(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, t: number, timestamp: number) {
  // Heartbeat timing (~80 BPM = 750ms per cycle)
  const beatT = ((timestamp % 750) / 750) * Math.PI * 2;
  const lub = Math.sin(beatT);
  const beatScale = 1 + (lub > 0.7 ? 0.55 : 0) * (lub - 0.7) / 0.3;
  const dubPhase = (beatT + Math.PI * 0.55) % (Math.PI * 2);
  const dub = Math.sin(dubPhase);
  const dubScale = 1 + (dub > 0.85 ? 0.25 : 0) * (dub - 0.85) / 0.15;
  const heartScale = Math.min(beatScale, 1.55) * Math.min(dubScale, 1.25);

  // Aura pulse in sync
  const auraAlpha = 0.08 + (lub > 0.7 ? 0.2 * (lub - 0.7) / 0.3 : 0);
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200 * heartScale);
  aura.addColorStop(0, `rgba(167,139,250,${auraAlpha})`);
  aura.addColorStop(0.5, `rgba(244,114,182,${auraAlpha * 0.5})`);
  aura.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, 200 * heartScale, 0, Math.PI * 2);
  ctx.fillStyle = aura;
  ctx.fill();

  // Faint orbit rings
  [[rx * 1.6, ry * 1.6, 0.04], [rx, ry, 0.1], [rx * 0.5, ry * 0.5, 0.05]].forEach(([rxi, ryi, a]) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rxi as number, ryi as number, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(167,139,250,${a})`;
    ctx.lineWidth = 0.5;
    if (rxi === rx && ryi === ry) {
      ctx.setLineDash([6, 8]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Center large pulsing heart
  ctx.save();
  ctx.shadowColor = 'rgba(167,139,250,0.4)';
  ctx.shadowBlur = 30;
  drawHeart(ctx, cx, cy, 42 * heartScale);
  ctx.fillStyle = 'rgba(167,139,250,0.15)';
  ctx.fill();
  ctx.shadowBlur = 18;
  drawHeart(ctx, cx, cy, 24 * heartScale);
  ctx.fillStyle = 'rgba(167,139,250,0.3)';
  ctx.fill();
  ctx.shadowBlur = 12;
  drawHeart(ctx, cx, cy, 12 * heartScale);
  ctx.fillStyle = 'rgba(167,139,250,0.6)';
  ctx.fill();
  ctx.restore();

  // Orbiting heart 1 (rose)
  const a1 = t * 0.3;
  const s1x = cx + Math.cos(a1) * rx;
  const s1y = cy + Math.sin(a1) * ry;
  ctx.save();
  ctx.shadowColor = '#f472b6';
  ctx.shadowBlur = 16;
  for (let i = 0; i < 8; i++) {
    const ta = a1 - i * 0.15;
    const tx = cx + Math.cos(ta) * rx;
    const ty = cy + Math.sin(ta) * ry;
    drawHeart(ctx, tx, ty, 5 - i * 0.3);
    ctx.fillStyle = `rgba(244,114,182,${0.35 - i * 0.04})`;
    ctx.fill();
  }
  drawHeart(ctx, s1x, s1y, 14);
  ctx.fillStyle = '#f472b6';
  ctx.fill();
  ctx.restore();

  // Orbiting heart 2 (gold)
  const a2 = -t * 0.45 + Math.PI;
  const s2x = cx + Math.cos(a2) * rx;
  const s2y = cy + Math.sin(a2) * ry;
  ctx.save();
  ctx.shadowColor = '#a78bfa';
  ctx.shadowBlur = 16;
  for (let i = 0; i < 8; i++) {
    const ta = a2 + i * 0.15;
    const tx = cx + Math.cos(ta) * rx;
    const ty = cy + Math.sin(ta) * ry;
    drawHeart(ctx, tx, ty, 5 - i * 0.3);
    ctx.fillStyle = `rgba(167,139,250,${0.35 - i * 0.04})`;
    ctx.fill();
  }
  drawHeart(ctx, s2x, s2y, 14);
  ctx.fillStyle = '#a78bfa';
  ctx.fill();
  ctx.restore();
}