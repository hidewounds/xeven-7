// graphbg index boost: fps under ignition + curve frames + tier swap.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'G:\\xeven-web\\verify\\cinema2';
mkdirSync(OUT, { recursive: true });
const M = { errors: [] };
const fps = (p, ms, move) => p.evaluate(([ms, move]) => new Promise((res) => {
  let f = 0; const tasks = [];
  const obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) tasks.push(Math.round(e.duration)); });
  try { obs.observe({ entryTypes: ['longtask'] }); } catch {}
  const t0 = performance.now();
  const tick = () => {
    f++;
    if (move) window.dispatchEvent(new MouseEvent('mousemove', { clientX: 300 + Math.random() * 1000, clientY: 200 + Math.random() * 500 }));
    if (performance.now() - t0 < ms) requestAnimationFrame(tick);
    else { obs.disconnect(); res({ fps: +(f / (ms / 1000)).toFixed(1), long: tasks.length }); }
  };
  requestAnimationFrame(tick);
}), [ms, move]);

const b = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--enable-precise-memory-info'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
p.on('pageerror', (e) => M.errors.push(String(e)));
await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
await p.waitForTimeout(1200);
try { await p.click('.intro', { timeout: 4000 }); } catch {}
try { await p.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch {}
await p.waitForTimeout(1500);
// scroll mid-index with ignition, then fps
await p.evaluate(() => window.scrollTo(0, 2500));
await p.waitForTimeout(1500);
M.indexFps = await fps(p, 10000, true);
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(1800);
await p.screenshot({ path: `${OUT}/c5-index-curve.png` });
// subpage tier: worlds flat + cheap
await p.goto('http://127.0.0.1:5000/#/worlds', { waitUntil: 'load' });
await p.waitForTimeout(3500);
M.worldsFps = await fps(p, 6000, true);
await p.screenshot({ path: `${OUT}/c5-worlds-flat.png` });
await b.close();

// mobile index sample
{
  const b2 = await chromium.launch({ executablePath: EDGE, headless: true });
  const mp = await b2.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  mp.on('pageerror', (e) => M.errors.push('m:' + String(e)));
  await mp.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await mp.waitForTimeout(1200);
  try { await mp.tap('.intro', { timeout: 4000 }); } catch {}
  try { await mp.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch {}
  await mp.waitForTimeout(1500);
  M.mFps = await fps(mp, 6000, false);
  M.mOver = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await mp.screenshot({ path: `${OUT}/c5-m-index.png` });
  await b2.close();
  const b3 = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await b3.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  const rp = await ctx.newPage();
  await rp.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await rp.waitForTimeout(2500);
  M.rOver = await rp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await b3.close();
}
writeFileSync(`${OUT}/c5-metrics.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
