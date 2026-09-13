// cinema2 fix-up: center-probe rail sweep, true pin-start/end veil,
// rail click-jump, hero rail state.
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'G:\\xeven-web\\verify\\cinema2';
const errors = [];
const b = await chromium.launch({ executablePath: EDGE, headless: true });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto('http://127.0.0.1:5000/#/enter', { waitUntil: 'load' });
await p.waitForTimeout(1200);
try { await p.click('.intro', { timeout: 4000 }); } catch {}
try { await p.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch {}
await p.waitForTimeout(1500);
const M = {};
const go = async (y, s = 2000) => { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(s); };
const railOn = () => p.evaluate(() => document.querySelector('.rail-btn.rail-on')?.textContent.trim().replace(/\s+/g, ' '));
const VH = 900;

// hero: true top (rail 00)
await go(0);
M.railHeroTop = await railOn();

// center-probe sweep for the rest
M.railSweep = {};
for (const sel of ['.st-mani', '.st-caps', '.st-proc', '.st-stats', '.st-tier', '.st-foot']) {
  const g = await p.evaluate((s) => {
    const el = document.querySelector(s);
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, h: r.height };
  }, sel);
  await go(g.top + g.h / 2 - VH / 2);
  M.railSweep[sel] = await railOn();
}

// true pin geometry from ScrollTrigger-free DOM: pin starts where reel top hits viewport top
const reelDocTop = await p.evaluate(() => {
  // pin-spacer offset: measure via preceding section bottom
  const proc = document.querySelector('.st-proc');
  const pr = proc.getBoundingClientRect();
  return Math.round(pr.top + window.scrollY + pr.height);
});
M.reelDocTop = reelDocTop;
await go(reelDocTop + 100, 2400);
M.veilTruePinStart = await p.evaluate(() => {
  const c = getComputedStyle(document.querySelector('.veil-white'));
  return { op: c.opacity, clip: c.clipPath };
});
M.markTruePinStart = await p.evaluate(() => {
  const el = document.querySelector('.mark-fixed');
  return { op: getComputedStyle(el).opacity };
});
await p.screenshot({ path: `${OUT}/c2-30-pinstart.png` });
await go(reelDocTop + 100 + VH * 2.2, 2400);
M.veilTruePinEnd = await p.evaluate(() => {
  const c = getComputedStyle(document.querySelector('.veil-white'));
  return { op: c.opacity, clip: c.clipPath };
});
await p.screenshot({ path: `${OUT}/c2-33-pinned.png` });

// rail click-jump to 03 PROCESS
await go(0, 2500);
await p.click('.rail-btn:nth-child(4)');
await p.waitForTimeout(3500);
M.clickJump03 = await p.evaluate(() => {
  const r = document.querySelector('.st-proc').getBoundingClientRect();
  const on = document.querySelector('.rail-btn.rail-on')?.textContent.trim().replace(/\s+/g, ' ');
  return { procTop: Math.round(r.top), rail: on };
});
await p.screenshot({ path: `${OUT}/c2-34-railclick.png` });

M.consoleErrors = errors;
writeFileSync(`${OUT}/c2-fixup.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
await b.close();
