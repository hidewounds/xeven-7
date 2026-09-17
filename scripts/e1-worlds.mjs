// NOVA content verification: worlds index links, study routes, Back
// restore, unknown-slug 404, teaser buttons. Real timers, headless Edge.
import { chromium } from 'playwright-core';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500/';
const errors = [];
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

const M = {};
await page.goto(`${URL}#/enter`, { waitUntil: 'load' });
await page.waitForTimeout(1200);
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch { M.introStuck = true; }

// index carries the five NOVA instruments + three-step setup
M.index = await page.evaluate(() => ({
  hero: document.querySelector('.st-hero-title')?.textContent,
  stations: document.querySelectorAll('.cap-station').length,
  stationTitles: Array.from(document.querySelectorAll('.cap-station h3')).map((h) => h.textContent),
  procRows: document.querySelectorAll('.st-proc .proc-row').length,
  stepTitles: Array.from(document.querySelectorAll('.st-proc .proc-row h3')).map((h) => h.textContent),
  teasers: document.querySelectorAll('button.tease-card').length,
}));

// worlds index: three real worlds
await page.goto(`${URL}#/worlds`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
M.worlds = await page.evaluate(() => ({
  cards: document.querySelectorAll('a.work-cell').length,
  hrefs: Array.from(document.querySelectorAll('a.work-cell')).map((a) => a.getAttribute('href')),
  posters: Array.from(document.querySelectorAll('.vid-poster')).map((v) => v.getAttribute('src')),
  videos: document.querySelectorAll('.vid video').length,
  divCells: document.querySelectorAll('div.work-cell').length,
}));

// open the Helm study, walk next, Back restores
await page.click('a.work-cell[href="#/worlds/helm"]');
await page.waitForTimeout(1200);
M.detail = await page.evaluate(() => ({
  hash: window.location.hash,
  title: document.querySelector('.page-title')?.textContent,
  docTitle: document.title,
  openLink: document.querySelector('.study-nav a[target="_blank"]')?.getAttribute('href'),
  prev: document.querySelector('.study-steps a[aria-label^="Previous"]')?.textContent,
  next: document.querySelector('.study-steps a[aria-label^="Next"]')?.textContent,
}));
await page.click('.study-steps a[aria-label^="Next"]');
await page.waitForTimeout(1000);
M.walked = await page.evaluate(() => ({
  hash: window.location.hash,
  title: document.querySelector('.page-title')?.textContent,
}));
await page.goto(`${URL}#/worlds`, { waitUntil: 'load' });
await page.waitForTimeout(1200);
M.restored = await page.evaluate(() => ({
  focused: document.activeElement?.id || document.activeElement?.tagName,
}));

// unknown slug → canonical enter
await page.goto(`${URL}#/worlds/nope`, { waitUntil: 'load' });
await page.waitForTimeout(1200);
M.bad = await page.evaluate(() => window.location.hash);

// services / vision / pricing / contact carry sourced copy
for (const [route, sel] of [['services', '.team-chip'], ['pricing', '.tier'], ['contact', '.form-card']]) {
  await page.goto(`${URL}#/${route}`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  M[route] = await page.evaluate((s) => ({
    title: document.querySelector('.page-title')?.textContent,
    count: document.querySelectorAll(s).length,
  }), sel);
}
M.vision = await page.evaluate(() => ({}));
await page.goto(`${URL}#/vision`, { waitUntil: 'load' });
await page.waitForTimeout(900);
M.vision = await page.evaluate(() => ({
  title: document.querySelector('.page-title')?.textContent,
  rows: document.querySelectorAll('.proc-row').length,
}));

M.errors = errors;
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
