// cinema3 fix-up: bloom-under-content re-probe + mobile + reduced.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'G:\\xeven-web\\verify\\cinema2';
mkdirSync(OUT, { recursive: true });
const M = { errors: [] };

// ---------- desktop re-probe ----------
{
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  p.on('pageerror', (e) => M.errors.push(String(e)));
  await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  try { await p.click('.intro', { timeout: 4000 }); } catch {}
  try { await p.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch {}
  await p.waitForTimeout(1500);
  const proc = await p.evaluate(() => {
    const el = document.querySelector('.st-proc');
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, h: r.height };
  });
  await p.evaluate((y) => window.scrollTo(0, y), proc.top + 300);
  await p.waitForTimeout(2000);
  M.procMid2 = await p.evaluate(() => {
    const pr = document.querySelector('.st-proc');
    const h3 = pr.querySelector('h3').getBoundingClientRect();
    return {
      bg: getComputedStyle(pr).backgroundColor,
      h3: getComputedStyle(pr.querySelector('h3')).color,
      mark: getComputedStyle(document.querySelector('.mark-fixed')).color,
      bloomOp: getComputedStyle(document.querySelector('.proc-bloom')).opacity,
      h3y: Math.round(h3.top),
    };
  });
  await p.screenshot({ path: `${OUT}/c3-procmid2.png` });
  await b.close();
}

// ---------- mobile 390 ----------
{
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => M.errors.push('m:' + String(e)));
  await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  try { await p.tap('.intro', { timeout: 4000 }); } catch {}
  try { await p.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.mIntroStuck = true; }
  await p.waitForTimeout(1500);
  const proc = await p.evaluate(() => {
    const el = document.querySelector('.st-proc');
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, h: r.height };
  });
  await p.evaluate((y) => window.scrollTo(0, y), proc.top + 200);
  await p.waitForTimeout(2200);
  M.mProc = await p.evaluate(() => ({
    bg: getComputedStyle(document.querySelector('.st-proc')).backgroundColor,
    mark: getComputedStyle(document.querySelector('.mark-fixed')).color,
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  await p.screenshot({ path: `${OUT}/c3-m-proc.png` });
  const reelTop = await p.evaluate(() => {
    const pr = document.querySelector('.st-proc').getBoundingClientRect();
    return Math.round(pr.top + window.scrollY + pr.height);
  });
  await p.evaluate((y) => window.scrollTo(0, y), reelTop + 60 + 844);
  await p.waitForTimeout(2400);
  M.mCells = await p.evaluate(() => [...document.querySelectorAll('.reel-cell')].map((c) => getComputedStyle(c).opacity));
  M.mTravel = await p.evaluate(() => {
    const t = document.querySelector('.reel-track');
    return { x: Math.round(new DOMMatrix(getComputedStyle(t).transform).e), expect: -(t.scrollWidth - window.innerWidth) };
  });
  M.mOver = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await p.screenshot({ path: `${OUT}/c3-m-row.png` });
  await b.close();
}

// ---------- reduced desktop ----------
{
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => M.errors.push('r:' + String(e)));
  await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  M.reduced = await p.evaluate(() => ({
    pins: document.querySelectorAll('.pin-spacer').length,
    bloom: getComputedStyle(document.querySelector('.proc-bloom')).display,
    mark: getComputedStyle(document.querySelector('.mark-fixed')).display,
    points: document.querySelectorAll('.proc-points li').length,
    procBg: getComputedStyle(document.querySelector('.st-proc')).backgroundColor,
    mani: [...document.querySelectorAll('.mani-word')].filter((w) => getComputedStyle(w).opacity === '1').length,
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  const pt = await p.evaluate(() => document.querySelector('.st-proc').getBoundingClientRect().top + window.scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), pt + 200);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/c3-r-proc.png` });
  await b.close();
}

writeFileSync(`${OUT}/c3-fixup.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
