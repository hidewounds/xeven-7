(() => {
  const canvas = document.querySelector('#indexStars');
  const orb = document.querySelector('#heroOrb');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas) {
    const ctx = canvas.getContext('2d'); const dots = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + .2 }));
    const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`; };
    const draw = (t = 0) => { const dpr = Math.min(devicePixelRatio || 1, 2); ctx.clearRect(0, 0, canvas.width, canvas.height); dots.forEach((d, i) => { const flicker = .22 + Math.sin(t * .001 + i) * .12; ctx.fillStyle = `rgba(210, 241, 255, ${flicker})`; ctx.beginPath(); ctx.arc(d.x * canvas.width, d.y * canvas.height, d.r * dpr, 0, Math.PI * 2); ctx.fill(); }); if (!reduceMotion) requestAnimationFrame(draw); };
    resize(); window.addEventListener('resize', resize); draw();
  }
  const onScroll = () => { const y = window.scrollY; const hero = document.querySelector('.hero-montage'); if (hero && orb) { const progress = Math.min(1, Math.max(0, y / (hero.offsetHeight - innerHeight))); const angle = progress * 180; const scale = 1 + progress * .35; orb.style.transform = `rotate(${angle}deg) scale(${scale})`; orb.style.filter = `hue-rotate(${progress * 65}deg)`; } };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (e) => { const id = link.getAttribute('href'); const target = document.querySelector(id); if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); } }));
})();
