// VOID layer verification: WebGL solids + starfield + reticle over STRATA.
// Real timers, headless Edge, text-first metrics + 3 frames.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500/#/enter';
const OUT = 'G:\\xeven-web\\verify\\void';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

const M = {};
const go = async (y, settle = 1500) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(settle);
};

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(900);
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
// lazy three chunk needs a beat to land + first frame
await page.waitForSelector('canvas.void-fixed', { timeout: 20000 });
await page.waitForTimeout(2500);

M.canvases = await page.evaluate(() => ({
  strata: !!document.querySelector('canvas.strata-fixed'),
  void: !!document.querySelector('canvas.void-fixed'),
  reticle: document.querySelectorAll('.reticle, .reticle-dot').length,
}));
M.webgl = await page.evaluate(() => {
  const c = document.querySelector('canvas.void-fixed');
  if (!c) return null;
  return { w: c.width, h: c.height };
});

// fps with BOTH canvases live
M.fpsBoth = await page.evaluate(() => new Promise((res) => {
  let n = 0;
  const t0 = performance.now();
  const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else res(Math.round((n * 1000) / (performance.now() - t0))); };
  requestAnimationFrame(tick);
}));

// pointer sweep: parallax + agitation paths, reticle blooms hot
await page.mouse.move(300, 400);
for (let x = 300; x <= 1300; x += 200) { await page.mouse.move(x, 450, { steps: 5 }); }
await page.waitForTimeout(1000);
M.reticleHot = await page.evaluate(() => ({
  ring: document.querySelector('.reticle')?.style.transform.slice(0, 48) ?? null,
  ringOp: document.querySelector('.reticle')?.style.opacity ?? null,
}));
await page.mouse.move(800, 450);
await page.screenshot({ path: `${OUT}/f0-void-hero.png` });

// scroll dolly: hero title scales through space, camera pushes
await go(500);
M.heroDolly = await page.evaluate(() => getComputedStyle(document.querySelector('.st-hero-title')).transform.slice(0, 56));
const capsTop = await page.evaluate(() => document.querySelector('.st-caps').getBoundingClientRect().top + window.scrollY);
await go(capsTop + 300);
await page.screenshot({ path: `${OUT}/f1-void-caps.png` });
const procTop = await page.evaluate(() => document.querySelector('.st-proc').getBoundingClientRect().top + window.scrollY);
await go(procTop + 900);
await page.screenshot({ path: `${OUT}/f2-void-proc.png` });

M.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
M.errors = errors;
writeFileSync(`${OUT}/d3-void.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify({ errors: errors.length, fpsBoth: M.fpsBoth, overflowX: M.overflowX, webgl: M.webgl }, null, 2));
await browser.close();
if (errors.length) { console.log('ERRORS:'); for (const e of errors.slice(0, 10)) console.log(' -', String(e).slice(0, 220)); process.exitCode = 1; }
