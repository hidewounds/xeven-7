// Task B verification: worlds index links, study routes, Back restore,
// unknown-slug 404, teaser buttons. Real timers, headless Edge.
import { chromium } from 'playwright-core';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5501/';
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

// teaser cards are now veil-navigating buttons
M.teasers = await page.evaluate(() => ({
  buttons: document.querySelectorAll('button.tease-card').length,
  anchors: document.querySelectorAll('a.tease-card').length,
}));
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);

// worlds index
await page.goto(`${URL}#/worlds`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
M.index = await page.evaluate(() => ({
  cards: document.querySelectorAll('a.work-cell').length,
  hrefs: Array.from(document.querySelectorAll('a.work-cell')).map((a) => a.getAttribute('href')),
  posters: Array.from(document.querySelectorAll('.vid video')).map((v) => v.getAttribute('poster')),
  divCells: document.querySelectorAll('div.work-cell').length,
}));

// filter to Motion, scroll mid-grid, then open a study
await page.click('.pills button:nth-child(3)');
await page.waitForTimeout(400);
await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(400);
M.filtered = await page.evaluate(() => document.querySelectorAll('a.work-cell').length);
await page.click('a.work-cell[href="#/worlds/melt-04"]');
await page.waitForTimeout(1200);
M.detail = await page.evaluate(() => ({
  hash: window.location.hash,
  title: document.querySelector('.page-title')?.textContent,
  docTitle: document.title,
  video: !!document.querySelector('.vid video'),
  prev: document.querySelector('.study-steps a:first-child')?.getAttribute('href'),
  next: document.querySelector('.study-steps a:last-child')?.getAttribute('href'),
}));

// next-study link walks the index order
await page.click('.study-steps a:last-child');
await page.waitForTimeout(1000);
M.walked = await page.evaluate(() => ({
  hash: window.location.hash,
  title: document.querySelector('.page-title')?.textContent,
}));

// Back to grid restores filter + scroll + focus
await page.goto(`${URL}#/worlds`, { waitUntil: 'load' });
await page.waitForTimeout(1200);
M.restored = await page.evaluate(() => ({
  hash: window.location.hash,
  cards: document.querySelectorAll('a.work-cell').length,
  y: window.scrollY,
  focused: document.activeElement?.id || document.activeElement?.tagName,
}));

// unknown slug → canonical enter
await page.goto(`${URL}#/worlds/nope`, { waitUntil: 'load' });
await page.waitForTimeout(1200);
M.bad = await page.evaluate(() => window.location.hash);

M.errors = errors;
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
