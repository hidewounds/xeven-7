// VOIDWORLD verification: unified canvas (lattice + shader field + solids +
// presence + waypoint camera). Real timers, headless Edge, metrics + frames.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500/#/enter';
const OUT = 'G:\\xeven-web\\verify\\world';
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
await page.waitForTimeout(1100);
// intro merge mid-gather (fresh load, before skip)
M.introMerge = await page.evaluate(() => ({
  ledger: document.querySelector('.intro-count')?.textContent ?? null,
  canvas: !!document.querySelector('.intro-stage'),
}));
await page.screenshot({ path: `${OUT}/g3-intro-merge.png` });
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
await page.waitForSelector('canvas.world-fixed', { timeout: 20000 });
await page.waitForTimeout(2500);

M.legacyGone = await page.evaluate(() => ({
  strata: !document.querySelector('canvas.strata-fixed'),
  void: !document.querySelector('canvas.void-fixed'),
  graph: !document.querySelector('canvas.graph-fixed'),
  world: !!document.querySelector('canvas.world-fixed'),
}));
// five-act index: no topbar, 5-stop rail, dead sections gone
M.acts = await page.evaluate(() => ({
  topbarVisible: !!document.querySelector('.topbar'),
  railBtns: document.querySelectorAll('.rail-btn').length,
  railFirst: document.querySelector('.rail-btn')?.textContent.replace(/\s+/g, ' ').trim(),
  mani: !document.querySelector('.st-mani'),
  stats: !document.querySelector('.st-stats'),
  tiers: !document.querySelector('.st-tier'),
  heroLabel: document.querySelector('.st-hero .mono')?.textContent,
  reticleDots: document.querySelectorAll('.reticle-dot').length,
  reticleRings: document.querySelectorAll('.reticle').length,
  reelCells: document.querySelectorAll('.reel-cell').length,
}));
M.fpsWorld = await page.evaluate(() => new Promise((res) => {
  let n = 0;
  const t0 = performance.now();
  const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else res(Math.round((n * 1000) / (performance.now() - t0))); };
  requestAnimationFrame(tick);
}));

// presence path + scroll journey through waypoints
await page.mouse.move(300, 400);
for (let x = 300; x <= 1300; x += 250) { await page.mouse.move(x, 500, { steps: 4 }); }
await page.mouse.click(800, 450);
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/g0-world-hero.png` });
const capsTop = await page.evaluate(() => document.querySelector('.st-caps').getBoundingClientRect().top + window.scrollY);
await go(capsTop + 300);
await page.screenshot({ path: `${OUT}/g1-world-caps.png` });
const procTop = await page.evaluate(() => document.querySelector('.st-proc').getBoundingClientRect().top + window.scrollY);
await go(procTop + 900);
await page.screenshot({ path: `${OUT}/g2-world-proc.png` });

// showreel stage mid-pin: letterboxed take + counter + a landed caps card
const reelTop = await page.evaluate(() => document.querySelector('.st-reel').getBoundingClientRect().top + window.scrollY);
await go(reelTop + 1400);
M.stage = await page.evaluate(() => ({
  count: document.querySelector('.reel-count')?.textContent.replace(/\s+/g, ' ').trim() ?? null,
  lit: [...document.querySelectorAll('.reel-cell')].filter((c) => getComputedStyle(c).opacity === '1').length,
  bars: document.querySelectorAll('.reel-bar').length,
  specs: document.querySelectorAll('.cap-specs span').length,
}));
await page.screenshot({ path: `${OUT}/g4-reel-stage.png` });

// route tier: flat park on subpages, journey resumes on return
await page.evaluate(() => { window.location.hash = '#/worlds'; });
await page.waitForTimeout(2500);
M.worldsAlive = await page.evaluate(() => !!document.querySelector('canvas.world-fixed'));
await page.evaluate(() => { window.location.hash = '#/enter'; });
await page.waitForTimeout(2500);
M.returnAlive = await page.evaluate(() => !!document.querySelector('canvas.world-fixed'));

M.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
M.errors = errors;
writeFileSync(`${OUT}/d4-world.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify({ errors: errors.length, fpsWorld: M.fpsWorld, overflowX: M.overflowX }, null, 2));
await browser.close();
if (errors.length) { console.log('ERRORS:'); for (const e of errors.slice(0, 10)) console.log(' -', String(e).slice(0, 220)); process.exitCode = 1; }
