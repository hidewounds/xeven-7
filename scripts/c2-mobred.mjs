// cinema2 mobile + reduced pass.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'G:\\xeven-web\\verify\\cinema2';
mkdirSync(OUT, { recursive: true });
const M = { mobile: {}, reduced: {} };

// ---------- mobile 390 ----------
{
  const errors = [];
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  try { await p.tap('.intro', { timeout: 4000 }); } catch {}
  try { await p.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.mobile.introStuck = true; }
  await p.waitForTimeout(1500);
  M.mobile.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  M.mobile.railHidden = await p.evaluate(() => getComputedStyle(document.querySelector('.rail')).display === 'none');
  await p.screenshot({ path: `${OUT}/c2-20-m-hero.png` });
  // fan deck on mobile: card0 mid-scrub
  const top0 = await p.evaluate(() => document.querySelectorAll('.cap-card')[0].getBoundingClientRect().top + window.scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), top0 - 844 * 0.8);
  await p.waitForTimeout(2200);
  M.mobile.deck0 = await p.evaluate(() => {
    const c = document.querySelectorAll('.cap-card')[0];
    return { op: getComputedStyle(c).opacity, tf: getComputedStyle(c).transform.slice(0, 60) };
  });
  await p.screenshot({ path: `${OUT}/c2-21-m-deck.png` });
  // row travel on mobile
  const reelTop = await p.evaluate(() => document.querySelector('.st-reel').getBoundingClientRect().top + window.scrollY);
  const travel = await p.evaluate(() => {
    const t = document.querySelector('.reel-track');
    return { scrollW: t.scrollWidth, winW: window.innerWidth };
  });
  M.mobile.travel = travel;
  await p.evaluate((y) => window.scrollTo(0, y), reelTop + 200);
  await p.waitForTimeout(2500);
  const pinOn = await p.evaluate(() => !!document.querySelector('.pin-spacer'));
  M.mobile.pinOn = pinOn;
  await p.screenshot({ path: `${OUT}/c2-22-m-row.png` });
  const docH = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.evaluate((y) => window.scrollTo(0, y), docH);
  await p.waitForTimeout(2500);
  M.mobile.overflowEnd = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  M.mobile.procMono = await p.evaluate(() => document.querySelector('.st-proc .mono')?.textContent);
  await p.screenshot({ path: `${OUT}/c2-23-m-foot.png` });
  M.mobile.errors = errors;
  await b.close();
}

// ---------- reduced motion desktop ----------
{
  const errors = [];
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  const R = M.reduced;
  R.noIntro = await p.evaluate(() => !document.querySelector('.intro'));
  R.pinSpacers = await p.evaluate(() => document.querySelectorAll('.pin-spacer').length);
  R.maniLit = await p.evaluate(() => {
    const w = [...document.querySelectorAll('.mani-word')];
    return `${w.filter((x) => getComputedStyle(x).opacity === '1').length}/${w.length}`;
  });
  R.procLine = await p.evaluate(() => getComputedStyle(document.querySelector('.proc-line span')).transform);
  R.veilHidden = await p.evaluate(() => {
    const el = document.querySelector('.veil-white');
    const c = getComputedStyle(el);
    return { display: c.display, clip: c.clipPath };
  });
  R.markHidden = await p.evaluate(() => getComputedStyle(document.querySelector('.mark-fixed')).display);
  R.reelStack = await p.evaluate(() => {
    const t = document.querySelector('.reel-track');
    const c = getComputedStyle(t);
    return { dir: c.flexDirection, width: c.width };
  });
  R.reelCellW = await p.evaluate(() => getComputedStyle(document.querySelector('.reel-cell')).width);
  R.counters = await p.evaluate(() => [...document.querySelectorAll('.stat-num')].map((e) => e.textContent));
  R.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await p.screenshot({ path: `${OUT}/c2-24-r-hero.png` });
  const capsTop = await p.evaluate(() => document.querySelector('.st-caps').getBoundingClientRect().top + window.scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), capsTop);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/c2-25-r-caps.png` });
  const reelTop = await p.evaluate(() => document.querySelector('.st-reel').getBoundingClientRect().top + window.scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), reelTop);
  await p.waitForTimeout(1200);
  R.cellsVisible = await p.evaluate(() =>
    [...document.querySelectorAll('.reel-cell')].map((c) => {
      const r = c.getBoundingClientRect();
      return Math.round(r.y);
    }));
  await p.screenshot({ path: `${OUT}/c2-26-r-reel.png` });
  R.errors = errors;
  await b.close();
}

writeFileSync(`${OUT}/c2-mobred.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
