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
// index v2 BURST: sharp stage film, anatomy stations, rotation cards
M.acts = await page.evaluate(() => {
  const vid = document.querySelector('.stage-film');
  return {
    topbarVisible: !!document.querySelector('.topbar'),
    rulerInches: document.querySelectorAll('.ruler-inch').length,
    rulerOn: document.querySelector('.ruler-inch.ruler-on')?.textContent.replace(/\s+/g, ' ').trim(),
    needle: !!document.querySelector('.ruler-needle'),
    heroKicker: document.querySelector('.bx-hero .mono')?.textContent,
    heroTitle: document.querySelector('.bx-title')?.textContent,
    stageVideo: !!vid,
    stagePlaying: vid ? !vid.paused && vid.readyState >= 2 : false,
    stageChrome: document.querySelector('.stage-chrome')?.textContent.replace(/\s+/g, ' ').trim(),
    parts: document.querySelectorAll('.bx-part').length,
    ghosts: document.querySelectorAll('.bx-ghost').length,
    cards: document.querySelectorAll('.bx-card').length,
    finaleTitle: document.querySelector('.bx-fin h2')?.textContent,
    reticleDots: document.querySelectorAll('.reticle-dot').length,
    reticleRings: document.querySelectorAll('.reticle').length,
  };
});
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

// hero hold: stage playing under the title
await page.mouse.move(1200, 300, { steps: 6 });
await page.waitForTimeout(800);
M.hold = await page.evaluate(() => ({
  filmW: document.querySelector('.stage-film')?.clientWidth ?? 0,
  tbLogoOp: getComputedStyle(document.querySelector('.tb-logo')).opacity,
}));
await page.screenshot({ path: `${OUT}/g0-world-hero.png` });

// anatomy descent + rotation cards + finale
const figTop = await page.evaluate(() => document.querySelector('.bx-fig').getBoundingClientRect().top + window.scrollY);
await go(figTop + 500);
await page.screenshot({ path: `${OUT}/g1-anatomy.png` });
const workTop = await page.evaluate(() => document.querySelector('.bx-work').getBoundingClientRect().top + window.scrollY);
await go(workTop + 300);
M.work = await page.evaluate(() => ({
  imgs: [...document.querySelectorAll('.bx-card img')].map((i) => i.naturalWidth),
}));
await page.screenshot({ path: `${OUT}/g2-work.png` });
await go(await page.evaluate(() => document.body.scrollHeight));
await page.screenshot({ path: `${OUT}/g4-finale.png` });

// route tier: flat park on subpages, journey resumes on return — plus the
// ruler needle travels cm ticks on a scrollable page, active inch follows
await page.evaluate(() => { window.location.hash = '#/worlds'; });
await page.waitForTimeout(2500);
M.worldsAlive = await page.evaluate(() => !!document.querySelector('canvas.world-fixed'));
await page.evaluate(() => { window.location.hash = '#/vision'; });
await page.waitForTimeout(2000);
M.ruler = await page.evaluate(() => ({
  on: document.querySelector('.ruler-inch.ruler-on')?.textContent.replace(/\s+/g, ' ').trim(),
  max: document.documentElement.scrollHeight - window.innerHeight,
}));
const needle0 = await page.evaluate(() => document.querySelector('.ruler-needle').style.transform);
await go(await page.evaluate(() => document.body.scrollHeight));
const needle1 = await page.evaluate(() => document.querySelector('.ruler-needle').style.transform);
M.ruler.travel = { needle0, needle1 };
await page.screenshot({ path: `${OUT}/g5-ruler.png` });
await page.evaluate(() => { window.location.hash = '#/enter'; });
await page.waitForTimeout(2500);
M.returnAlive = await page.evaluate(() => !!document.querySelector('canvas.world-fixed'));

M.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
M.errors = errors;
writeFileSync(`${OUT}/d4-world.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify({ errors: errors.length, fpsWorld: M.fpsWorld, overflowX: M.overflowX }, null, 2));
await browser.close();
if (errors.length) { console.log('ERRORS:'); for (const e of errors.slice(0, 10)) console.log(' -', String(e).slice(0, 220)); process.exitCode = 1; }
