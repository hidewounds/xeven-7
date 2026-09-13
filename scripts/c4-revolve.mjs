// cinema4 pass: round revolve summon/carry/cover/uncover + regression.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'G:\\xeven-web\\verify\\cinema2';
mkdirSync(OUT, { recursive: true });
const M = { errors: [] };
const b = await chromium.launch({ executablePath: EDGE, headless: true });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
p.on('pageerror', (e) => M.errors.push(String(e)));
await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
await p.waitForTimeout(1200);
try { await p.click('.intro', { timeout: 4000 }); } catch {}
try { await p.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch {}
await p.waitForTimeout(1500);
const VH = 900;
const go = async (y, s = 1900) => { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(s); };
const rev = () => p.evaluate(() => {
  const r = document.querySelector('.revolve');
  const c = getComputedStyle(r);
  const d = getComputedStyle(document.querySelector('.revolve-disc'));
  const s = getComputedStyle(document.querySelector('.revolve-spin'));
  return { op: c.opacity, clip: c.clipPath, disc: d.transform.slice(0, 70), spin: s.transform.slice(0, 70) };
});
const hero = await p.evaluate(() => {
  const el = document.querySelector('.st-hero');
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: r.height };
});

// summon: just past hero exit
await go(hero.top + hero.h - VH * 0.5);
M.summon = await rev();
await p.screenshot({ path: `${OUT}/c4-summon.png` });
// carry mid: caps middle
const caps = await p.evaluate(() => {
  const el = document.querySelector('.st-caps');
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: r.height };
});
await go(caps.top + caps.h * 0.5 - VH / 2);
M.carry = await rev();
await p.screenshot({ path: `${OUT}/c4-carry.png` });
// cover: reel approach (revolve end zone)
const reelTop = await p.evaluate(() => {
  const pr = document.querySelector('.st-proc').getBoundingClientRect();
  return Math.round(pr.top + window.scrollY + pr.height);
});
await go(reelTop - VH * 0.75, 2200);
M.cover = await rev();
M.coverMark = await p.evaluate(() => ({
  word: getComputedStyle(document.querySelector('.mark-word')).opacity,
  x: getComputedStyle(document.querySelector('.mark-x')).opacity,
}));
await p.screenshot({ path: `${OUT}/c4-cover.png` });
// uncover/pin: pin engaged, both covers cleared
await go(reelTop + 120, 2400);
M.pin = await p.evaluate(() => ({
  revOp: getComputedStyle(document.querySelector('.revolve')).opacity,
  markOp: getComputedStyle(document.querySelector('.mark-fixed')).opacity,
  rail: document.querySelector('.rail-btn.rail-on')?.textContent.trim().replace(/\s+/g, ' '),
}));
await p.screenshot({ path: `${OUT}/c4-uncover.png` });
// regression: exact travel + cells sequential + proc bloom intact
await go(reelTop + 120 + VH * 2.2, 2200);
M.travel = await p.evaluate(() => {
  const t = document.querySelector('.reel-track');
  return { x: Math.round(new DOMMatrix(getComputedStyle(t).transform).e), expect: -(t.scrollWidth - window.innerWidth) };
});
await go(reelTop + 120 + VH * 1.1, 2200);
M.cells = await p.evaluate(() => [...document.querySelectorAll('.reel-cell')].map((c) => getComputedStyle(c).opacity));
const proc = await p.evaluate(() => {
  const el = document.querySelector('.st-proc');
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: r.height };
});
await go(proc.top + 300);
M.bloom = await p.evaluate(() => ({
  bg: getComputedStyle(document.querySelector('.st-proc')).backgroundColor,
  mark: getComputedStyle(document.querySelector('.mark-fixed')).color,
}));
await b.close();

// ---------- mobile + reduced ----------
{
  const b2 = await chromium.launch({ executablePath: EDGE, headless: true });
  const mp = await b2.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  mp.on('pageerror', (e) => M.errors.push('m:' + String(e)));
  await mp.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await mp.waitForTimeout(1200);
  try { await mp.tap('.intro', { timeout: 4000 }); } catch {}
  try { await mp.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch {}
  await mp.waitForTimeout(1500);
  const rt = await mp.evaluate(() => {
    const pr = document.querySelector('.st-proc').getBoundingClientRect();
    return Math.round(pr.top + window.scrollY + pr.height);
  });
  await mp.evaluate((y) => window.scrollTo(0, y), rt - 844 * 0.7);
  await mp.waitForTimeout(2200);
  M.mCover = await mp.evaluate(() => ({
    revOp: getComputedStyle(document.querySelector('.revolve')).opacity,
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  await mp.screenshot({ path: `${OUT}/c4-m-cover.png` });
  await b2.close();
  const b3 = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await b3.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  const rp = await ctx.newPage();
  rp.on('pageerror', (e) => M.errors.push('r:' + String(e)));
  await rp.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await rp.waitForTimeout(2500);
  M.reduced = await rp.evaluate(() => ({
    pins: document.querySelectorAll('.pin-spacer').length,
    rev: getComputedStyle(document.querySelector('.revolve')).display,
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  await b3.close();
}

writeFileSync(`${OUT}/c4-metrics.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
