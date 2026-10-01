(() => {
  const page = document.body;
  const button = document.querySelector('#enterButton');
  const orbCanvas = document.querySelector('#orbCanvas');
  const starCanvas = document.querySelector('#starfield');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fit = (canvas) => { const dpr = Math.min(window.devicePixelRatio || 1, 2); const r = canvas.getBoundingClientRect(); canvas.width = r.width * dpr; canvas.height = r.height * dpr; return { ctx: canvas.getContext('2d'), w: canvas.width, h: canvas.height, dpr }; };
  let orbState = fit(orbCanvas); let starState = fit(starCanvas);
  const stars = Array.from({ length: 150 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), s: Math.random() * 1.7 + .25 }));

  function drawStars() { const { ctx, w, h } = starState; ctx.clearRect(0, 0, w, h); stars.forEach((p) => { p.z += .0007; if (p.z > 1) p.z = 0; const a = Math.max(0, (1 - p.z) * .65); ctx.fillStyle = `rgba(214, 246, 255, ${a})`; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.s * (1 - p.z) * starState.dpr, 0, Math.PI * 2); ctx.fill(); }); if (!reduceMotion) requestAnimationFrame(drawStars); }
  function drawOrb(time = 0) { const { ctx, w, h } = orbState; ctx.clearRect(0, 0, w, h); const d = orbState.dpr, cx = w / 2, cy = h / 2, r = Math.min(w, h) * .32; const glow = ctx.createRadialGradient(cx, cy, r * .5, cx, cy, r * 1.7); glow.addColorStop(0, 'rgba(168,137,255,.28)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h); const g = ctx.createRadialGradient(cx - r * .34, cy - r * .38, r * .04, cx, cy, r); g.addColorStop(0, '#fff'); g.addColorStop(.07, '#c8f3ff'); g.addColorStop(.22, '#97a3ff'); g.addColorStop(.48, '#563aad'); g.addColorStop(.8, '#1a103d'); g.addColorStop(1, '#03020a'); ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(time * .0003) * .1); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.globalCompositeOperation = 'screen'; for (let i = -6; i < 8; i++) { ctx.strokeStyle = `rgba(${140 + i * 8}, ${100 + i * 8}, 255, .15)`; ctx.lineWidth = 1.3 * d; ctx.beginPath(); ctx.moveTo(-r * 1.2, i * r * .28 + Math.sin(time * .001 + i) * 9 * d); ctx.bezierCurveTo(-r * .3, i * r * .1, r * .3, i * r * .45, r * 1.2, i * r * .1); ctx.stroke(); } ctx.restore(); if (!reduceMotion) requestAnimationFrame(drawOrb); }
  function resize() { orbState = fit(orbCanvas); starState = fit(starCanvas); if (reduceMotion) { drawStars(); drawOrb(); } }
  window.addEventListener('resize', resize);
  drawStars(); drawOrb();

  let pointer = { x: 0, y: 0 }; window.addEventListener('pointermove', (e) => { pointer.x = (e.clientX / innerWidth - .5) * 2; pointer.y = (e.clientY / innerHeight - .5) * 2; const machine = document.querySelector('#arcadeWrap'); if (machine && !page.classList.contains('entering')) machine.style.transform = `perspective(1100px) rotateY(${-8 + pointer.x * 3}deg) rotateX(${2 - pointer.y * 2}deg) translateY(${pointer.y * -4}px)`; });
  button?.addEventListener('click', () => { page.classList.add('entering'); button.disabled = true; window.setTimeout(() => { window.location.href = 'index.html'; }, 1000); });
})();
