// Counters
document.addEventListener('DOMContentLoaded', ()=>{
  // year
  const y = new Date().getFullYear(); document.getElementById('year').textContent = y;

  const counters = document.querySelectorAll('.num');
  const speed = 1200;
  const runCounter = (el) => {
    const target = +el.dataset.target;
    let current = 0;
    const step = Math.max(1, Math.floor(target / (speed / 16)));
    const tick = () => {
      current += step;
      if (current >= target) { el.textContent = target.toLocaleString(); return; }
      el.textContent = current.toLocaleString();
      requestAnimationFrame(tick);
    };
    tick();
  };
  const obs = new IntersectionObserver((entries, o)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ runCounter(e.target); o.unobserve(e.target); } });
  },{threshold:0.5});
  counters.forEach(c=>obs.observe(c));

  // Accordion
  document.querySelectorAll('.acc-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const panel = btn.nextElementSibling;
      const open = panel.style.maxHeight && panel.style.maxHeight !== '0px';
      document.querySelectorAll('.acc-panel').forEach(p=>p.style.maxHeight = null);
      if(!open){ panel.style.maxHeight = panel.scrollHeight + 'px'; }
    });
  });

  // Scroll reveal
  const reveals = document.querySelectorAll('.section, .card, .review, .team-card');
  const ro = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in-view'); });
  },{threshold:0.12});
  reveals.forEach(r=>ro.observe(r));

  // Simple hero particles (canvas)
  const canvas = document.getElementById('hero-canvas');
  if(canvas){
    const ctx = canvas.getContext('2d');
    let W, H, particles=[];
    const DPR = window.devicePixelRatio || 1;
    function resize(){ W=canvas.width=canvas.clientWidth * DPR; H=canvas.height=canvas.clientHeight * DPR; canvas.style.width = canvas.clientWidth + 'px'; canvas.style.height = canvas.clientHeight + 'px'; }
    window.addEventListener('resize', resize); resize();
    function create(){
      particles = [];
      for(let i=0;i<64;i++){
        particles.push({
          x:Math.random()*W,
          y:Math.random()*H,
          vx:(Math.random()-0.5)*0.6,
          vy:(Math.random()-0.5)*0.6,
          r:2+Math.random()*3,
          alpha:0.18+Math.random()*0.6,
          phase: Math.random()*Math.PI*2
        });
      }
    }
    create();
    let last = performance.now();
    function draw(now){
      const dt = Math.min(40, now - last); last = now;
      ctx.clearRect(0,0,W,H);
      for(const p of particles){
        // gentle oscillation so particles move even without mouse
        const osc = Math.sin((now||0)/900 + p.phase) * 0.25 * DPR;
        p.x += p.vx * (dt/16) + osc;
        p.y += p.vy * (dt/16) + Math.cos((now||0)/1200 + p.phase) * 0.18 * DPR;
        if(p.x < -20*DPR) p.x = W + 20*DPR;
        if(p.x > W + 20*DPR) p.x = -20*DPR;
        if(p.y < -20*DPR) p.y = H + 20*DPR;
        if(p.y > H + 20*DPR) p.y = -20*DPR;
        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6*DPR);
        g.addColorStop(0,'rgba(127,155,255,'+p.alpha+')');
        g.addColorStop(1,'rgba(127,155,255,0)');
        ctx.fillStyle = g;
        ctx.arc(p.x,p.y,p.r*DPR,0,Math.PI*2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
});

  // Optional: moved hero float logic here and disabled by default.
  // Call `enableHeroFloat()` from the console or other script to attach mouse handlers.
  function enableHeroFloat(){
    const el = document.getElementById('hero-float');
    if(!el) return ()=>{};
    function onMove(e){
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      el.style.transform = `translate3d(${dx * 12}px, ${dy * 8}px, 0) rotate(${dx * 3}deg)`;
    }
    function onLeave(){ el.style.transform = 'translate3d(0,0,0) rotate(0deg)'; }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return ()=>{ window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseleave', onLeave); };
  }
  window.enableHeroFloat = enableHeroFloat;
