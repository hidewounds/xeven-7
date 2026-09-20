// MOBILE-ENTER baseline (open backlog 31–39): 390px enter capture with a
// LONGER settle (6s) so baselines stop catching the mid-intro wash.
// Real timers, headless Edge, metrics + frame.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500';
const OUT = 'D:\\xeven-web\\verify\\alt-stack';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

const M = {};
await page.goto(`${URL}/#/enter`, { waitUntil: 'load' });
await page.waitForTimeout(6000); // long settle: intro wash must be over
M.settled = await page.evaluate(() => ({
  intro: !!document.querySelector('.intro'),
  ledger: document.querySelector('.intro-count')?.textContent ?? null,
  world: !!document.querySelector('canvas.world-fixed'),
}));
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
try { await page.waitForSelector('canvas.world-fixed', { timeout: 20000 }); } catch { M.worldMissing = true; }
await page.waitForTimeout(2500);
M.final = await page.evaluate(() => ({
  world: !!document.querySelector('canvas.world-fixed'),
  hero: document.querySelector('.st-hero h1, h1')?.textContent?.slice(0, 40) ?? null,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await page.screenshot({ path: `${OUT}/e4-mobile-enter.png` });

M.errors = errors;
writeFileSync(`${OUT}/e4-mobile-enter.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
