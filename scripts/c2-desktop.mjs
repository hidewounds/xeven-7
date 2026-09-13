// cinema2 desktop pass: A fan deck, B swap, C wash, D rise-flip, E row.
// Real timers, headless Edge, text-first metrics + decision frames.
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
const docTop = async (sel, i = 0) => await page.evaluate(({ sel, i }) => {
  const els = document.querySelectorAll(sel);
  const el = els[i];
  const r = el.getBoundingClientRect();
  return r.top + window.scrollY;
}, { sel, i });
const go = async (y, settle = 1400) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(settle);
};
const css = async (sel, props, i = 0) => await page.evaluate(({ sel, props, i }) => {
  const el = document.querySelectorAll(sel)[i];
  const c = getComputedStyle(el);
  const o = {};
  for (const p of props) o[p] = c[p];
  o.rect = (() => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })();
  return o;
}, { sel, props, i });

// --- boot: skip intro, settle ---
await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(1200);
try {
  await page.click('.intro', { timeout: 4000 });
} catch {}
try {
  await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 });
} catch { M.introStuck = true; }
await page.waitForTimeout(1500);
M.noIntro = await page.evaluate(() => !document.querySelector('.intro'));
await shot('c2-00-hero');

// --- B: swap order / rail / mono (text) ---
M.sectionOrder = await page.evaluate(() =>
  [...document.querySelectorAll('.st-scroll > section')].map((s) => s.className));
M.railLabels = await page.evaluate(() =>
  [...document.querySelectorAll('.rail-btn')].map((b) => b.textContent.trim().replace(/\s+/g, ' ')));
M.procMono = await page.evaluate(() => document.querySelector('.st-proc .mono')?.textContent);
M.statsMono = await page.evaluate(() => document.querySelector('.st-stats .mono')?.textContent);
M.reelGhost = await page.evaluate(() => !!document.querySelector('.st-reel .reel-ghost'));

// --- A: fan deck per card (mid-scrub deck state + landed) ---
M.cards = [];
const vh = 900;
for (let i = 0; i < 4; i++) {
  const top = await docTop('.cap-card', i);
  await go(top - vh * 0.88); // card top at 88% viewport: inside 100%->62% scrub
  const mid = await css('.cap-card', ['opacity', 'transform'], i);
  M.cards.push({ i, deck: mid });
  await shot(`c2-0${i + 1}-deck`);
}
const top0 = await docTop('.cap-card', 0);
await go(top0 - vh * 0.35); // all four landed
await page.waitForTimeout(1200);
M.landed = [];
for (let i = 0; i < 4; i++) M.landed.push(await css('.cap-card', ['opacity', 'transform'], i));
M.slots = await page.evaluate(() =>
  [...document.querySelectorAll('.cap-card')].map((c) => {
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.x), w: Math.round(r.width) };
  }));
await shot('c2-05-slots');

// --- D: rise (proc crossing) ---
const procTop = await docTop('.st-proc');
const procH = await page.evaluate(() => document.querySelector('.st-proc').getBoundingClientRect().height);
await go(procTop + procH / 2 - vh / 2, 1800);
M.markRise = await css('.mark-fixed', ['opacity', 'transform', 'visibility']);
M.markRectRise = M.markRise.rect;
await shot('c2-06-rise');

// --- D: flip-cover (reel approach) ---
const reelTop = await docTop('.st-reel');
await go(reelTop - vh * 0.95, 1800);
M.markFlip = await css('.mark-fixed', ['opacity', 'transform', 'visibility']);
await shot('c2-07-flip');

// --- C: wash peak (reel top ~65% viewport) ---
await go(reelTop - vh * 0.65, 1800);
M.veil = await css('.veil-white', ['opacity', 'clipPath', 'backgroundImage']);
M.cell0wash = await css('.reel-cell', ['opacity'], 0);
await shot('c2-08-wash');

// --- E: pinned row — start / mid / end ---
await go(reelTop + 120, 2000); // engage pin
M.pinSpacer = await page.evaluate(() => !!document.querySelector('.pin-spacer'));
M.travel = await page.evaluate(() => {
  const t = document.querySelector('.reel-track');
  return { scrollW: t.scrollWidth, winW: window.innerWidth, expect: t.scrollWidth - window.innerWidth };
});
const pinStart = await page.evaluate(() => window.scrollY);
M.rowStart = await css('.reel-track', ['transform']);
await go(pinStart + vh * 1.1, 1600);
M.rowMid = await css('.reel-track', ['transform']);
await shot('c2-09-row-mid');
// end of pin: approach from recorded pin start + 2.2 viewport heights
await go(pinStart + vh * 2.3, 2000);
M.rowEnd = await css('.reel-track', ['transform']);
M.rowEndScroll = await page.evaluate(() => window.scrollY);
await shot('c2-10-row-end');

// --- rail tracking across stops ---
M.railTrack = await page.evaluate(() => {
  const on = document.querySelector('.rail-btn.rail-on');
  return on ? on.textContent.trim().replace(/\s+/g, ' ') : '(none)';
});

// --- jump determinism: jump to top then straight to reel, veil must drain parity ---
await go(0, 2500);
await go(reelTop - vh * 0.65, 3000);
M.veilJump = await css('.veil-white', ['opacity', 'clipPath']);
M.jumpParity = M.veil.opacity === M.veilJump.opacity && M.veil.clipPath === M.veilJump.clipPath;

M.consoleErrors = errors;
M.docH = await page.evaluate(() => document.documentElement.scrollHeight);
writeFileSync(`${OUT}/c2-metrics.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
await browser.close();
