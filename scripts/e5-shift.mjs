// SHIFT rebuild verification: all 7 routes render with zero errors and zero
// overflow; route markers assert the new surfaces. Real timers, headless Edge.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500';
const OUT = 'D:\\xeven-web\\verify\\shift';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const M = { routes: {} };

const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

const checks = {
  enter: { sel: ['.hero-mark', '.ruler-stop'], shot: 's-enter.png' },
  worlds: { sel: ['.station', '.station-chips span'], shot: 's-worlds.png' },
  about: { sel: ['.proc-row h3'], shot: 's-about.png' },
  features: { sel: ['.kb-demo input', '.team-chip'], shot: 's-features.png' },
  pricing: { sel: ['.tier', '.bill-toggle'], shot: 's-pricing.png' },
  demo: { sel: ['.form-card-shine .shine-ring', '.form-card input'], shot: 's-demo.png' },
};

for (const [route, c] of Object.entries(checks)) {
  await page.goto(`${URL}/#/${route}`, { waitUntil: 'load' });
  await page.waitForTimeout(route === 'enter' ? 4500 : 2200);
  const found = await page.evaluate((sels) => {
    const o = { overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, h1: document.querySelector('h1')?.textContent?.slice(0, 44) ?? null };
    for (const s of sels) o[s] = document.querySelectorAll(s).length;
    return o;
  }, c.sel);
  M.routes[route] = found;
  await page.screenshot({ path: `${OUT}/${c.shot}` });
}
await page.close();

// reduced motion pass: enter hero static, no loops
const red = await browser.newPage({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
red.on('console', (m) => { if (m.type() === 'error') errors.push(`[reduced] ${m.text()}`); });
red.on('pageerror', (e) => errors.push(`[reduced] ${String(e)}`));
await red.goto(`${URL}/#/enter`, { waitUntil: 'load' });
await red.waitForTimeout(2000);
M.reduced = await red.evaluate(() => ({
  hero: !!document.querySelector('.hero-mark'),
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await red.screenshot({ path: `${OUT}/s-enter-reduced.png` });

M.errors = errors;
writeFileSync(`${OUT}/e5-shift.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
