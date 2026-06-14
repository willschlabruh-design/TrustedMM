import { useEffect, useRef } from 'react';

type Particle = { x:number; y:number; vx:number; vy:number; r:number; hue:number };

export default function Particles({ count = 80 } : { count?: number }){
  const ref = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(()=>{
    const canvas = ref.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    let w = canvas.width = canvas.clientWidth * devicePixelRatio;
    let h = canvas.height = canvas.clientHeight * devicePixelRatio;
    const curCanvas = canvas as HTMLCanvasElement;
    const curCtx = ctx as CanvasRenderingContext2D;
    const particles: Particle[] = [];
    for(let i=0;i<count;i++) particles.push({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6, r: 1 + Math.random()*2.5, hue: Math.random()*360, phase: Math.random()*Math.PI*2 } as any);

    let raf = 0;
    function resize(){ w = curCanvas.width = curCanvas.clientWidth * devicePixelRatio; h = curCanvas.height = curCanvas.clientHeight * devicePixelRatio; }
    let last = performance.now();

    function step(now:number){
      const dt = Math.min(40, now - last); last = now;
      curCtx.clearRect(0,0,w,h);
      // draw faint background glow
      for(const p of particles){
        // mouse interaction: repel
        const dx = p.x - mouse.current.x * devicePixelRatio;
        const dy = p.y - mouse.current.y * devicePixelRatio;
        const dist = Math.sqrt(dx*dx + dy*dy) + 0.001;
        const force = Math.max(0, 120*devicePixelRatio - dist);
        if(force > 0){
          p.vx += (dx/dist) * (force / 9000) * (dt/16);
          p.vy += (dy/dist) * (force / 9000) * (dt/16);
        }
        // gentle global oscillation so particles drift even without mouse
        const tOscX = Math.sin(now/800 + (p as any).phase) * 0.22 * devicePixelRatio;
        const tOscY = Math.cos(now/1200 + (p as any).phase) * 0.18 * devicePixelRatio;
        // movement
        p.x += (p.vx + tOscX) * (dt/16) * devicePixelRatio;
        p.y += (p.vy + tOscY) * (dt/16) * devicePixelRatio;
        // gentle damping
        p.vx *= 0.99; p.vy *= 0.99;
        // wrap
        if(p.x < -20*devicePixelRatio) p.x = w + 20*devicePixelRatio;
        if(p.x > w + 20*devicePixelRatio) p.x = -20*devicePixelRatio;
        if(p.y < -20*devicePixelRatio) p.y = h + 20*devicePixelRatio;
        if(p.y > h + 20*devicePixelRatio) p.y = -20*devicePixelRatio;

        // draw
        curCtx.beginPath();
        const grad = curCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6*devicePixelRatio);
        grad.addColorStop(0, `hsla(${p.hue},80%,65%,0.9)`);
        grad.addColorStop(0.3, `hsla(${p.hue},80%,60%,0.25)`);
        grad.addColorStop(1, `hsla(${p.hue},80%,55%,0)`);
        curCtx.fillStyle = grad;
        curCtx.fillRect(p.x - p.r*6*devicePixelRatio, p.y - p.r*6*devicePixelRatio, p.r*12*devicePixelRatio, p.r*12*devicePixelRatio);
      }

      // connections (sparse)
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          const max = 9000 * devicePixelRatio * devicePixelRatio;
          if(d2 < max){
            const alpha = 0.12 * (1 - d2 / max);
            curCtx.strokeStyle = `hsla(${(a.hue+b.hue)/2},80%,60%,${alpha})`;
            curCtx.lineWidth = 0.6 * devicePixelRatio;
            curCtx.beginPath(); curCtx.moveTo(a.x, a.y); curCtx.lineTo(b.x, b.y); curCtx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(step);
    }

    function onMouse(e: MouseEvent){ mouse.current.x = e.clientX; mouse.current.y = e.clientY; }
    function onLeave(){ mouse.current.x = -9999; mouse.current.y = -9999; }
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);
    resize();
    raf = requestAnimationFrame(step);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMouse); window.removeEventListener('mouseleave', onLeave); window.removeEventListener('resize', resize); };
  },[count]);

  return (
    <canvas ref={ref} className="particles-canvas absolute inset-0 w-full h-full pointer-events-none" />
  );
}
