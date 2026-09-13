// cinema2 closeout: reduced re-check, resize, veil pin states, rail sweep,
// departure, 45s soak, mobile-reduced.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'G:\\xeven-web\\verify\\cinema2';
mkdirSync(OUT, { recursive: true });
const M = {};
const errors = [];

// ---------- desktop closeout ----------
{
  const b = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--enable-precise-memory-info'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  try { await p.click('.intro', { timeout: 4000 }); } catch {}
  try { await p.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
  await p.waitForTimeout(1500);
  const go = async (y, s = 1700) => { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(s); };
  const railOn = () => p.evaluate(() => document.querySelector('.rail-btn.rail-on')?.textContent.trim().replace(/\s+/g, ' '));

  // rail sweep across all sections
  M.railSweep = {};
  for (const sel of ['.st-hero', '.st-mani', '.st-caps', '.st-proc', '.st-reel', '.st-stats', '.st-tier', '.st-foot']) {
    const top = await p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);
    const h = await p.evaluate((s) => document.querySelector(s).getBoundingClientRect().height, sel);
    await go(top + Math.min(h / 2, 400));
    M.railSweep[sel] = await railOn();
  }

  // veil at pin start vs pin end
  const reelTop = await p.evaluate(() => document.querySelector('.st-reel').getBoundingClientRect().top + window.scrollY);
  await go(reelTop + 150, 2200);
  M.veilPinStart = await p.evaluate(() => {
    const c = getComputedStyle(document.querySelector('.veil-white'));
    return { op: c.opacity, clip: c.clipPath };
  });
  await p.screenshot({ path: `${OUT}/c2-30-pinstart.png` });
  // pin end: track x == -(scrollW - winW) within 2px
  await go(reelTop + 150 + 900 * 2.3, 2200);
  M.veilPinEnd = await p.evaluate(() => {
    const c = getComputedStyle(document.querySelector('.veil-white'));
    return { op: c.opacity, clip: c.clipPath };
  });
  M.pinExact = await p.evaluate(() => {
    const t = document.querySelector('.reel-track');
    const m = new DOMMatrix(getComputedStyle(t).transform);
    return { x: Math.round(m.e), expect: -(t.scrollWidth - window.innerWidth) };
  });

  // departure: wordmark back, mark click homes
  const docH = await p.evaluate(() => document.documentElement.scrollHeight);
  await go(docH, 2200);
  M.tbLogoAtFoot = await p.evaluate(() => getComputedStyle(document.querySelector('.tb-logo')).opacity);
  await p.screenshot({ path: `${OUT}/c2-31-departure.png` });

  // 45s soak on pinned reel: fps, longtasks, heap delta
  await go(reelTop + 900, 2200);
  const soak = await p.evaluate(() => new Promise((res) => {
    let frames = 0; const tasks = [];
    const obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) tasks.push(Math.round(e.duration)); });
    try { obs.observe({ entryTypes: ['longtask'] }); } catch {}
    const h0 = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const t0 = performance.now();
    const tick = () => { frames++; if (performance.now() - t0 < 45000) requestAnimationFrame(tick); else {
      obs.disconnect();
      const h1 = performance.memory ? performance.memory.usedJSHeapSize : 0;
      res({ fps: Math.round(frames / 45), longtasks: tasks.length, maxTask: tasks.length ? Math.max(...tasks) : 0, heapMB: [+(h0 / 1048576).toFixed(1), +(h1 / 1048576).toFixed(1)] });
    }};
    requestAnimationFrame(tick);
  }));
  M.soak45 = soak;
  await b.close();
}

// ---------- resize re-measure 1600 -> 1400 ----------
{
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  try { await p.click('.intro', { timeout: 4000 }); } catch {}
  try { await p.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch {}
  await p.waitForTimeout(1500);
  const reelTop = await p.evaluate(() => document.querySelector('.st-reel').getBoundingClientRect().top + window.scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), reelTop + 150 + 900 * 2.3);
  await p.waitForTimeout(2200);
  M.resize1400 = await p.evaluate(() => {
    const t = document.querySelector('.reel-track');
    const m = new DOMMatrix(getComputedStyle(t).transform);
    return { winW: window.innerWidth, scrollW: t.scrollWidth, x: Math.round(m.e), expect: -(t.scrollWidth - window.innerWidth) };
  });
  // fan re-measure on narrow: deck state sane (finite, converging near mark)
  const top0 = await p.evaluate(() => document.querySelectorAll('.cap-card')[0].getBoundingClientRect().top + window.scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), top0 - 900 * 0.85);
  await p.waitForTimeout(1800);
  M.resizeDeck = await p.evaluate(() => {
    const c = document.querySelectorAll('.cap-card')[0];
    const r = c.getBoundingClientRect();
    return { op: getComputedStyle(c).opacity, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) } };
  });
  await b.close();
}

// ---------- reduced re-check + mobile reduced ----------
{
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  M.reducedOverflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await ctx.close();
  const mctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
  const mp = await mctx.newPage();
  const merrs = [];
  mp.on('pageerror', (e) => merrs.push(String(e)));
  await mp.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await mp.waitForTimeout(2500);
  M.mReduced = await mp.evaluate(() => ({
    pins: document.querySelectorAll('.pin-spacer').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    cells: document.querySelectorAll('.reel-cell').length,
  }));
  M.mReduced.errors = merrs;
  await mp.screenshot({ path: `${OUT}/c2-32-m-reduced-reel.png` });
  await b.close();
}

// ---------- chunks traced ----------
M.chunks = readdirSync('G:\\xeven-web\\dist\\assets')
  .map((f) => ({ f, kb: +(statSync(`G:\\xeven-web\\dist\\assets/${f}`).size / 1024).toFixed(2) }))
  .sort((a, b) => b.kb - a.kb);

M.consoleErrors = errors;
writeFileSync(`${OUT}/c2-closeout.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
