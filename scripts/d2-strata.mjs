// STRATA lineage verification: mock background + cursor blob live in repo.
// Real timers, headless Edge, text-first metrics + 3 frames.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500/#/enter';
const OUT = 'G:\\xeven-web\\verify\\strata';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

const M = {};
const go = async (y, settle = 1400) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(settle);
};

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(900);
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
await page.waitForTimeout(1500);

// canvas presence + overscan geometry
M.canvas = await page.evaluate(() => {
  const c = document.querySelector('canvas.strata-fixed');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), vw: window.innerWidth, vh: window.innerHeight };
});
M.oldGone = await page.evaluate(() => !document.querySelector('canvas.graph-fixed'));

// fps probe over 2s on the live hero
M.fpsHero = await page.evaluate(() => new Promise((res) => {
  let n = 0;
  const t0 = performance.now();
  const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else res(Math.round((n * 1000) / (performance.now() - t0))); };
  requestAnimationFrame(tick);
}));

// cursor blob path: sweep the finger, cells must kindle without errors
await page.mouse.move(200, 300);
for (let x = 200; x <= 1400; x += 150) { await page.mouse.move(x, 300 + ((x / 150) % 2) * 200, { steps: 6 }); }
await page.waitForTimeout(800);
await page.mouse.click(800, 450);
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/e0-strata-hero.png` });

// scroll the cinema over the new field
const capsTop = await page.evaluate(() => document.querySelector('.st-caps').getBoundingClientRect().top + window.scrollY);
await go(capsTop + 400);
await page.screenshot({ path: `${OUT}/e1-strata-caps.png` });
const procTop = await page.evaluate(() => document.querySelector('.st-proc').getBoundingClientRect().top + window.scrollY);
await go(procTop + 800);
M.errorsMid = errors.length;

// route switch: flat tier on subpages, canvas persists, no errors
await page.evaluate(() => { window.location.hash = '#/worlds'; });
await page.waitForTimeout(2500);
M.worldsCanvas = await page.evaluate(() => !!document.querySelector('canvas.strata-fixed'));
M.worldsTitle = await page.evaluate(() => document.querySelector('.page-title')?.textContent ?? null);
await page.screenshot({ path: `${OUT}/e2-worlds-flat.png` });
await page.evaluate(() => { window.location.hash = '#/enter'; });
await page.waitForTimeout(2500);

M.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// mobile 390: flat load, no errors, no overflow
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
mob.on('console', (m) => { if (m.type() === 'error') errors.push('mob: ' + m.text()); });
mob.on('pageerror', (e) => errors.push('mob: ' + String(e)));
await mob.goto(URL, { waitUntil: 'load' });
await mob.waitForTimeout(1200);
try { await mob.tap('.intro', { timeout: 4000 }); } catch {}
await mob.waitForTimeout(1500);
M.mobOverflowX = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
M.mobCanvas = await mob.evaluate(() => !!document.querySelector('canvas.strata-fixed'));

M.errors = errors;
writeFileSync(`${OUT}/d2-strata.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify({ errors: errors.length, fpsHero: M.fpsHero, overflowX: M.overflowX, mobOverflowX: M.mobOverflowX }, null, 2));
await browser.close();
if (errors.length) { console.log('ERRORS:'); for (const e of errors.slice(0, 10)) console.log(' -', String(e).slice(0, 220)); process.exitCode = 1; }
