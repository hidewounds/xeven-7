// cinema3 pass: spacing, proc detail, bloom in/hold/out, 3D X wipe,
// sequential curve-attached reel cells. Real timers, headless Edge.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5000/#/enter';
const OUT = 'G:\\xeven-web\\verify\\cinema2';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

const M = {};
const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); };
const go = async (y, settle = 1700) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(settle);
};
const docTop = async (sel) => await page.evaluate((s) => {
  const el = document.querySelector(s);
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: r.height };
}, sel);
const bloomState = () => page.evaluate(() => {
  const b = getComputedStyle(document.querySelector('.proc-bloom'));
  const m = getComputedStyle(document.querySelector('.mark-fixed'));
  const p = document.querySelector('.st-proc');
  const pb = getComputedStyle(p).backgroundColor;
  const h3 = getComputedStyle(p.querySelector('h3')).color;
  return {
    bloom: { op: b.opacity, clip: b.clipPath },
    markColor: m.color,
    procBg: pb,
    procH3: h3,
    wordOp: getComputedStyle(document.querySelector('.mark-word')).opacity,
    xOp: getComputedStyle(document.querySelector('.mark-x')).opacity,
    markTf: m.transform.slice(0, 90),
  };
});

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(1200);
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
await page.waitForTimeout(1500);
M.noIntro = await page.evaluate(() => !document.querySelector('.intro'));

// --- 1. spacing (computed px @900px vh) + detail counts ---
M.spacing = await page.evaluate(() => {
  const px = (s) => Math.round(parseFloat(getComputedStyle(document.querySelector(s)).paddingTop));
  return { caps: px('.st-caps'), proc: px('.st-proc'), reel: px('.st-reel'), stats: px('.st-stats'), tier: px('.st-tier'), foot: px('.st-foot') };
});
M.detail = await page.evaluate(() => ({
  points: document.querySelectorAll('.proc-points li').length,
  metas: document.querySelectorAll('.proc-meta').length,
  xEl: !!document.querySelector('.mark-x'),
  bloomEl: !!document.querySelector('.proc-bloom'),
}));

// --- 2/3/4. bloom approach / hold / retract ---
const proc = await docTop('.st-proc');
const VH = 900;
await go(proc.top - VH * 0.95);
M.approach = await bloomState();
await shot('c3-approach');
await go(proc.top + 300);
M.procMid = await bloomState();
await shot('c3-procmid');
await go(proc.top + proc.h - VH * 0.4);
M.procExit = await bloomState();
await shot('c3-exit');

// --- 5. 3D X wipe state near proc exit ---
await go(proc.top + proc.h - VH * 0.62);
M.wipe = await bloomState();
M.wipeRect = await page.evaluate(() => {
  const r = document.querySelector('.mark-fixed').getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
});
await shot('c3-wipe');

// --- 6. reel: exact travel + sequential cells at pin mid ---
const reelDocTop = await page.evaluate(() => {
  const pr = document.querySelector('.st-proc').getBoundingClientRect();
  return Math.round(pr.top + window.scrollY + pr.height);
});
await go(reelDocTop + 100, 2400);
M.markAtPin = await page.evaluate(() => getComputedStyle(document.querySelector('.mark-fixed')).opacity);
await go(reelDocTop + 100 + VH * 1.1, 2200);
M.cells = await page.evaluate(() => [...document.querySelectorAll('.reel-cell')].map((c) => {
  const s = getComputedStyle(c);
  return { op: s.opacity, tf: s.transform.slice(0, 60) };
}));
M.travel = await page.evaluate(() => {
  const t = document.querySelector('.reel-track');
  const m = new DOMMatrix(getComputedStyle(t).transform);
  return { x: Math.round(m.e), expect: -(t.scrollWidth - window.innerWidth) };
});
await shot('c3-rowmid');
await go(reelDocTop + 100 + VH * 2.2, 2200);
M.travelEnd = await page.evaluate(() => {
  const t = document.querySelector('.reel-track');
  const m = new DOMMatrix(getComputedStyle(t).transform);
  return { x: Math.round(m.e), expect: -(t.scrollWidth - window.innerWidth) };
});

// --- rail sweep (center-probe) ---
M.rail = {};
M.rail.hero = await (async () => { await go(0); return page.evaluate(() => document.querySelector('.rail-btn.rail-on')?.textContent.trim().replace(/\s+/g, ' ')); })();
for (const sel of ['.st-mani', '.st-caps', '.st-proc', '.st-stats', '.st-tier', '.st-foot']) {
  const g = await docTop(sel);
  await go(g.top + g.h / 2 - VH / 2);
  M.rail[sel] = await page.evaluate(() => document.querySelector('.rail-btn.rail-on')?.textContent.trim().replace(/\s+/g, ' '));
}

M.consoleErrors = errors;
writeFileSync(`${OUT}/c3-metrics.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
await browser.close();
