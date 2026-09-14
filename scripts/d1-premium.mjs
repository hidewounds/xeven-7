// cinema4 premium closeout: P1 chrome, P2 gate/hero, P3 ember+ghosts,
// P4 thread node + row light, P5 punch + counter, P6 rules/tiers/finale.
// Real timers, headless Edge, text-first metrics + 3 frames.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500/#/enter';
const OUT = 'G:\\xeven-web\\verify\\cinema4';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

const M = {};
const docTop = async (sel, i = 0) => await page.evaluate(({ sel, i }) => {
  const el = document.querySelectorAll(sel)[i];
  return el.getBoundingClientRect().top + window.scrollY;
}, { sel, i });
const go = async (y, settle = 1400) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(settle);
};
const tx = async (sel, i = 0) => await page.evaluate(({ sel, i }) => {
  const el = document.querySelectorAll(sel)[i];
  return el ? getComputedStyle(el).transform.slice(0, 72) : null;
}, { sel, i });
const op = async (sel, i = 0) => await page.evaluate(({ sel, i }) => {
  const el = document.querySelectorAll(sel)[i];
  return el ? getComputedStyle(el).opacity : null;
}, { sel, i });

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(900);
// P2 gate ledger live before skip
M.ledger = await page.evaluate(() => ({
  count: document.querySelector('.intro-count')?.textContent ?? null,
  word: document.querySelector('.intro-word')?.textContent ?? null,
}));
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
await page.waitForTimeout(1500);

// P2 hero
M.echo = await page.evaluate(() => !!document.querySelector('.hero-echo'));
M.cue0 = await tx('.st-cue b');
await page.screenshot({ path: `${OUT}/d1-hero.png` });

// P1 chrome after scroll
await go(1200);
M.topbarSolid = await page.evaluate(() => document.querySelector('.topbar')?.className);
M.railProgress = await tx('.rail-progress');

// P3
M.embers = await page.evaluate(() => document.querySelectorAll('.mani-ember').length);
M.ghosts = await page.evaluate(() => document.querySelectorAll('.cap-ghost').length);

// P4 thread + row light
const procTop = await docTop('.st-proc');
await go(procTop - 400);
M.nodeRide = await tx('.thread-node');
M.stubDrawn = await tx('.proc-stub');
await go(procTop + 600);
M.rowOn = await page.evaluate(() => document.querySelectorAll('.proc-row.proc-on').length);
await page.screenshot({ path: `${OUT}/d1-thread.png` });

// P5 cover + counter
const procH = await page.evaluate(() => document.querySelector('.st-proc').offsetHeight);
await go(procTop + procH - 500);
M.markScale = await tx('.mark-fixed');
await go(await docTop('.st-reel') + 1200);
M.reelCount = await page.evaluate(() => document.querySelector('.reel-count')?.textContent.replace(/\s+/g, ' ').trim());

// P6 finale states
await go(await docTop('.stat', 0));
M.ruleFull = await tx('.stat-rule');
await go(await page.evaluate(() => document.body.scrollHeight));
M.tiers = await page.evaluate(() => [...document.querySelectorAll('.tier')].map((t) => getComputedStyle(t).opacity));
M.footClock = await page.evaluate(() => document.querySelector('.foot-time')?.textContent ?? null);
M.footH2op = await op('.st-foot h2');
await page.screenshot({ path: `${OUT}/d1-finale.png` });

M.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
M.errors = errors;
writeFileSync(`${OUT}/d1-premium.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify({ errors: errors.length, overflowX: M.overflowX, reelCount: M.reelCount, footClock: M.footClock }, null, 2));
await browser.close();
if (errors.length) { console.log('ERRORS:'); for (const e of errors.slice(0, 10)) console.log(' -', e.slice(0, 220)); process.exitCode = 1; }
