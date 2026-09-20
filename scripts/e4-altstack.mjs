// ALT-STACK verification: lazy R3F vignette on /about (own chunk, never
// first paint), ShineBorder booking card on /demo, reduced-motion stand-down.
// Real timers, headless Edge, metrics + frames.
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
const M = {};

const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

// about: vignette mounts a real canvas, lands its entrance, no overflow
await page.goto(`${URL}/#/about`, { waitUntil: 'load' });
try { await page.waitForSelector('.field-study canvas', { timeout: 25000 }); } catch { M.aboutCanvas = false; }
await page.evaluate(() => document.querySelector('.field-study')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(2500);
M.about = await page.evaluate(() => ({
  canvas: !!document.querySelector('.field-study canvas'),
  landed: document.querySelector('.field-study')?.classList.contains('landed'),
  caption: document.querySelector('.field-study figcaption')?.textContent ?? null,
  externalVideo: Array.from(document.querySelectorAll('.vid video')).map((v) => v.currentSrc || v.src),
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await page.screenshot({ path: `${OUT}/e4-about.png` });

// demo: booking card wears the shine ring, form intact
await page.goto(`${URL}/#/demo`, { waitUntil: 'load' });
await page.waitForTimeout(2000);
M.demo = await page.evaluate(() => ({
  shine: !!document.querySelector('.shine-ring'),
  card: !!document.querySelector('.form-card.form-card-shine'),
  inputs: document.querySelectorAll('.form-card input').length,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await page.screenshot({ path: `${OUT}/e4-demo.png` });
await page.close();

// reduced motion: still panel, zero canvas, zero errors
const red = await browser.newPage({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
red.on('console', (m) => { if (m.type() === 'error') errors.push(`[reduced] ${m.text()}`); });
red.on('pageerror', (e) => errors.push(`[reduced] ${String(e)}`));
await red.goto(`${URL}/#/about`, { waitUntil: 'load' });
await red.waitForTimeout(2000);
M.reduced = await red.evaluate(() => ({
  still: !!document.querySelector('.field-study-still'),
  canvas: !!document.querySelector('.field-study canvas'),
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await red.screenshot({ path: `${OUT}/e4-about-reduced.png` });

M.errors = errors;
writeFileSync(`${OUT}/e4-altstack.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
