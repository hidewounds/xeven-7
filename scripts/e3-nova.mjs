// Post-rebuild verification: nova-only content, new journey order,
// pricing toggle math, five routes, worlds gone, booking form.
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
await page.waitForTimeout(1000);

M.journey = await page.evaluate(() => ({
  hero: document.querySelector('.st-hero-title')?.textContent,
  order: Array.from(document.querySelectorAll('.st-scroll > section, .st-scroll > footer')).map((el) => el.className),
  steps: Array.from(document.querySelectorAll('.st-proc .proc-row h3')).map((h) => h.textContent),
  stations: Array.from(document.querySelectorAll('.cap-station h3')).map((h) => h.textContent),
  bolts: document.querySelectorAll('.bolt-stat').length,
  trust: document.querySelector('.trustline')?.textContent?.slice(0, 40),
  trial: document.querySelector('.trial-card h2')?.textContent,
  lab: !!document.querySelector('.x-console'),
  worldsRefs: document.body.innerText.match(/reactor|helm|melt/gi)?.length ?? 0,
}));

// pricing toggle math: Growth $79 → $758/yr, setup free
await page.goto(`${URL}#/pricing`, { waitUntil: 'load' });
await page.waitForTimeout(1000);
M.pricingM = await page.evaluate(() => ({
  tiers: document.querySelectorAll('.tier').length,
  growth: document.querySelectorAll('.tier')[1]?.querySelector('.tier-price')?.textContent,
  setup: document.querySelectorAll('.tier')[1]?.querySelector('.mono')?.textContent,
}));
await page.click('.page .pills button:has-text("Yearly")');
await page.waitForTimeout(400);
M.pricingY = await page.evaluate(() => ({
  growth: document.querySelectorAll('.tier')[1]?.querySelector('.tier-price')?.textContent,
  setup: document.querySelectorAll('.tier')[1]?.querySelector('.mono')?.textContent,
  launch: document.querySelectorAll('.tier')[0]?.querySelector('.tier-price')?.textContent,
  custom: document.querySelectorAll('.tier')[3]?.querySelector('.tier-price')?.textContent,
}));

// five routes render; worlds + slugs 404 to enter
for (const r of ['vision', 'services', 'pricing', 'contact']) {
  await page.goto(`${URL}#/${r}`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  M['route_' + r] = await page.evaluate(() => document.querySelector('.page-title')?.textContent);
}
await page.goto(`${URL}#/worlds`, { waitUntil: 'load' });
await page.waitForTimeout(800);
M.worldsGone = await page.evaluate(() => window.location.hash);
await page.goto(`${URL}#/worlds/reactor`, { waitUntil: 'load' });
await page.waitForTimeout(800);
M.slugGone = await page.evaluate(() => window.location.hash);

// booking form mirrors the briefing room
await page.goto(`${URL}#/contact`, { waitUntil: 'load' });
await page.waitForTimeout(800);
M.contact = await page.evaluate(() => ({
  focus: document.querySelectorAll('[aria-label="Demo focus"] button').length,
  slots: document.querySelectorAll('[aria-label="Demo slot"] button').length,
}));

// desktop nav lists four links, no worlds (burger is mobile-only)
await page.goto(`${URL}#/enter`, { waitUntil: 'load' });
await page.waitForTimeout(800);
M.menu = await page.evaluate(() => Array.from(document.querySelectorAll('.tb-center .tb-link')).map((b) => b.textContent));
M.ruler = await page.evaluate(() => Array.from(document.querySelectorAll('.ruler-inch')).map((b) => b.getAttribute('aria-label')));

M.errors = errors;
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
