// Tasks C+D verification: X mechanism console, auto configs, tune panel,
// no-WebGL emblem, reduced-motion static, rapid nav, touch, visibility.
import { chromium } from 'playwright-core';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500/';
const errors = [];
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const M = {};
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const xstate = () => page.evaluate(() => window.__voidworld?.xState?.() ?? null);

await page.goto(`${URL}#/enter`, { waitUntil: 'load' });
await page.waitForTimeout(1200);
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }
await page.waitForSelector('canvas.world-fixed', { timeout: 20000 });
await page.waitForTimeout(2000);

M.lab = await page.evaluate(() => ({
  section: !!document.querySelector('.st-xlab'),
  cfgBtns: document.querySelectorAll('.x-console [aria-label="Mechanism configuration"] button').length,
  matBtns: document.querySelectorAll('.x-console [aria-label="Mechanism material"] button').length,
  slider: !!document.querySelector('.x-stage[role="slider"]'),
}));
M.cfg0 = await xstate();
// manual override via console buttons
await page.click('.x-console [aria-label="Mechanism configuration"] button:nth-child(3)');
await page.waitForTimeout(600);
await page.click('.x-console [aria-label="Mechanism material"] button:nth-child(3)');
await page.waitForTimeout(600);
M.manual = await xstate();
// drag the slider strip via synthetic pointer drag (real PointerEvents)
const deg0 = await page.evaluate(() => document.querySelector('.x-stage b')?.textContent);
await page.evaluate(() => {
  const el = document.querySelector('.x-stage');
  const r = el.getBoundingClientRect();
  el.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + 50, bubbles: true }));
  el.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + 200, bubbles: true }));
  el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
});
await page.waitForTimeout(300);
M.drag = await page.evaluate(() => ({
  before: null,
  deg: document.querySelector('.x-stage b')?.textContent,
  spin: !!window.__voidworld,
}));
M.drag.before = deg0;
// back to auto + reset (text selectors — unambiguous)
await page.click('.x-console [aria-label="Mechanism configuration"] button:has-text("auto")');
await page.click('.x-console button:has-text("Reset spin")');
await page.waitForTimeout(400);
// auto config follows scroll: hero → caps → work → fin
const cfgs = {};
for (const [k, y] of [['hero', 100], ['caps', 2500], ['work', 7000], ['fin', 20000]]) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(1400);
  cfgs[k] = await xstate();
}
M.auto = cfgs;
// visibility toggle must not crash the loop
await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
await page.waitForTimeout(400);
M.visOk = await page.evaluate(() => !!document.querySelector('canvas.world-fixed'));
// rapid navigation: two veil navs back-to-back land on the second
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.click('.trial-card .pill');
await page.click('.tb-logo');
await page.waitForTimeout(1500);
M.rapid = await page.evaluate(() => window.location.hash);
await page.close();

// ?tune dev panel
const t2 = await browser.newPage({ viewport: { width: 1600, height: 900 } });
t2.on('pageerror', (e) => errors.push('tune:' + String(e)));
await t2.goto(`${URL}#/enter?tune`, { waitUntil: 'load' });
await t2.waitForTimeout(1500);
M.tune = await t2.evaluate(() => ({
  panel: !!document.querySelector('.tune'),
  sliders: document.querySelectorAll('.tune input[type="range"]').length,
}));
await t2.close();

// ?nowebgl deterministic fallback
const t3 = await browser.newPage({ viewport: { width: 1600, height: 900 } });
t3.on('pageerror', (e) => errors.push('nowebgl:' + String(e)));
await t3.goto(`${URL}#/enter?nowebgl=1`, { waitUntil: 'load' });
await t3.waitForTimeout(2000);
M.nogl = await t3.evaluate(() => ({
  canvasHidden: getComputedStyle(document.querySelector('canvas.world-fixed')).display === 'none',
  emblem: !!document.querySelector('.x-emblem'),
  heroTitle: document.querySelector('.st-hero-title')?.textContent?.slice(0, 14),
  gridIntact: document.querySelectorAll('.cap-station').length,
}));
await t3.close();

// reduced motion: static frame, console still safe
const rctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
const t4 = await rctx.newPage();
t4.on('pageerror', (e) => errors.push('reduced:' + String(e)));
await t4.goto(`${URL}#/enter`, { waitUntil: 'load' });
await t4.waitForTimeout(2000);
M.reduced = await t4.evaluate(() => ({
  canvas: !!document.querySelector('canvas.world-fixed'),
  lab: !!document.querySelector('.st-xlab'),
  console: !!document.querySelector('.x-console'),
}));
await t4.click('.x-console [aria-label="Mechanism material"] button:nth-child(1)');
await t4.waitForTimeout(400);
M.reduced.clickOk = true;
await rctx.close();

// touch: burger menu + tap through to services at 390px
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const t5 = await mctx.newPage();
t5.on('pageerror', (e) => errors.push('touch:' + String(e)));
await t5.goto(`${URL}#/enter`, { waitUntil: 'load' });
await t5.waitForTimeout(1500);
await t5.tap('.tb-burger');
await t5.waitForTimeout(800);
await t5.tap('.mnav-link >> nth=1');
await t5.waitForTimeout(1500);
M.touch = await t5.evaluate(() => ({ hash: window.location.hash, title: document.querySelector('.page-title')?.textContent }));
await mctx.close();

M.errors = errors;
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
