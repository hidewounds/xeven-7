// cinema2 supplement: flip re-time check, all-landed slots, rail 03,
// mark-gone-at-pin, wash peak sweep, resize re-measure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://127.0.0.1:5000/#/enter';
const OUT = 'G:\\xeven-web\\verify\\cinema2';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const M = {};
const shot = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); };
const go = async (y, s = 1600) => { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(s); };
const geom = async (sel, i = 0) => await page.evaluate(({ sel, i }) => {
  const el = document.querySelectorAll(sel)[i];
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height) };
}, { sel, i });
const markState = () => page.evaluate(() => {
  const el = document.querySelector('.mark-fixed');
  const c = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { op: c.opacity, tf: c.transform.slice(0, 80), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
});

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(1200);
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
await page.waitForTimeout(1500);

M.proc = await geom('.st-proc');
M.reel = await geom('.st-reel');
M.caps = await geom('.st-caps');

// flip re-time: mark size at proc middle (must be small now) + at proc exit (flip mid)
await go(M.proc.top + M.proc.h / 2 - 450, 2000);
M.markProcMid = await markState();
await shot('c2-11-procmid');
await go(M.proc.top + M.proc.h - 900 * 0.6, 2000);
M.markProcExit = await markState();
await shot('c2-12-procexit');

// all-landed: last card top to 40% viewport
const lastTop = await geom('.cap-card', 3);
await go(lastTop.top - 900 * 0.4, 2200);
M.landedAll = await page.evaluate(() =>
  [...document.querySelectorAll('.cap-card')].map((c) => ({ op: getComputedStyle(c).opacity })));
await shot('c2-13-alllanded');

// rail 03 at proc
await go(M.proc.top + 200, 1800);
M.railAtProc = await page.evaluate(() =>
  document.querySelector('.rail-btn.rail-on')?.textContent.trim().replace(/\s+/g, ' '));
await shot('c2-14-railproc');

// mark gone at pin start
const reelTop = (await geom('.st-reel')).top;
await go(reelTop + 300, 2200);
M.markAtPin = await markState();
M.railAtReel = await page.evaluate(() =>
  document.querySelector('.rail-btn.rail-on')?.textContent.trim().replace(/\s+/g, ' '));

// wash peak sweep: reel top from 100% to 30% viewport in 7 steps
M.washSweep = [];
for (let k = 0; k <= 6; k++) {
  const y = reelTop - 900 * (1 - k * 0.1167);
  await go(y, 1300);
  const v = await page.evaluate(() => {
    const el = document.querySelector('.veil-white');
    const c = getComputedStyle(el);
    return { op: c.opacity, clip: c.clipPath };
  });
  M.washSweep.push({ reelTopPct: Math.round((1 - k * 0.1167) * 100), ...v });
}
await go(reelTop - 450, 1500);
await shot('c2-15-washpeak');

M.consoleErrors = errors;
writeFileSync(`${OUT}/c2-sup.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
await browser.close();
