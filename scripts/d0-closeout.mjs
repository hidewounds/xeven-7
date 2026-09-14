// cinema3 closeout smoke: deck (A), connector thread (B), symmetric second
// half (C). Real timers, headless Edge, text-first metrics + 2 frames.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500/#/enter';
const OUT = 'G:\\xeven-web\\verify\\cinema3';
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
const style = async (sel, i = 0) => await page.evaluate(({ sel, i }) => {
  const el = document.querySelectorAll(sel)[i];
  const c = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { opacity: c.opacity, transform: c.transform.slice(0, 64), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
}, { sel, i });

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(1200);
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
await page.waitForTimeout(1500);

M.sections = await page.evaluate(() =>
  [...document.querySelectorAll('.st-scroll > section')].map((s) => s.className));
M.railBtns = await page.evaluate(() => document.querySelectorAll('.rail-btn').length);
M.capCards = await page.evaluate(() => document.querySelectorAll('.cap-card').length);
M.hasStub = await page.evaluate(() => !!document.querySelector('.proc-stub'));

// A: deck — mid-caps, first card should be landed (opacity 1, ~identity)
await go(await docTop('.cap-card', 0));
M.card0landed = await style('.cap-card', 0);
M.card3rest = await style('.cap-card', 3);

// B: thread — proc approach: stub drawn, spine partial
const procTop = await docTop('.st-proc');
await go(procTop - 500);
M.stubMid = await style('.proc-stub');
M.spineMid = await style('.proc-line > span');
await page.screenshot({ path: `${OUT}/d0-proc-thread.png` });

// flip zone: mark huge, reel track blooming in
const procH = await page.evaluate(() => document.querySelector('.st-proc').offsetHeight);
await go(procTop + procH - 700);
M.markCover = await style('.mark-fixed');
M.reelBloom = await style('.reel-track');
await page.screenshot({ path: `${OUT}/d0-x-cover.png` });

// C: second half rhythm states at rest
await go(await docTop('.stat', 0));
M.stat0 = await style('.stat', 0);
await go(await docTop('.tier', 0));
M.tier0 = await style('.tier', 0);
await go(await page.evaluate(() => document.body.scrollHeight));
M.footH2 = await style('.st-foot h2');
M.tbLogoBack = await style('.tb-logo');

M.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
M.errors = errors;
writeFileSync(`${OUT}/d0-closeout.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify({ errors: errors.length, overflowX: M.overflowX, sections: M.sections.length }, null, 2));
await browser.close();
if (errors.length) { console.log('ERRORS:'); for (const e of errors.slice(0, 10)) console.log(' -', e.slice(0, 220)); process.exitCode = 1; }
