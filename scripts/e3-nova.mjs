// Post-rebuild verification: unified nav model, renamed routes, shared
// footer, pricing toggle math, demo plan preselect, booking form, no
// worlds anywhere. Real timers, headless Edge.
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

// one nav model drives topbar, menu, footer; the rail is index-only
M.nav = await page.evaluate(() => ({
  top: Array.from(document.querySelectorAll('.tb-center .tb-link')).map((b) => b.textContent),
  railIndex: Array.from(document.querySelectorAll('.ruler-inch')).map((b) => b.getAttribute('aria-label')),
  foot: Array.from(document.querySelectorAll('.sitefoot-link')).map((b) => b.textContent),
  mega: !!document.querySelector('.sitefoot-mega'),
}));

// rail click jumps to the instruments section + marks it active
await page.click('.ruler-inch >> nth=2');
await page.waitForTimeout(1800);
M.rail = await page.evaluate(() => ({
  y: Math.round(window.scrollY),
  active: document.querySelector('.ruler-inch.ruler-on')?.getAttribute('aria-label'),
}));

// index journey: telemetry → instruments → proof → trial, then footer
M.journey = await page.evaluate(() => ({
  hero: document.querySelector('.st-hero-title')?.textContent,
  order: Array.from(document.querySelectorAll('.st-scroll > section')).map((el) => el.className),
  steps: Array.from(document.querySelectorAll('.st-proc .proc-row h3')).map((h) => h.textContent),
  stations: document.querySelectorAll('.cap-station').length,
  bolts: document.querySelectorAll('.bolt-stat').length,
  trial: document.querySelector('.trial-card h2')?.textContent,
  footer: !!document.querySelector('.sitefoot'),
  worldsRefs: document.body.innerText.match(/reactor|helm|melt|worlds/gi)?.length ?? 0,
}));

// pricing toggle math + plan handoff into demo
await page.goto(`${URL}#/pricing`, { waitUntil: 'load' });
await page.waitForTimeout(1000);
await page.click('.page .pills button:has-text("Yearly")');
await page.waitForTimeout(400);
M.pricingY = await page.evaluate(() => ({
  growth: document.querySelectorAll('.tier')[1]?.querySelector('.tier-price')?.textContent,
  setup: document.querySelectorAll('.tier')[1]?.querySelector('.mono')?.textContent,
  launch: document.querySelectorAll('.tier')[0]?.querySelector('.tier-price')?.textContent,
  custom: document.querySelectorAll('.tier')[3]?.querySelector('.tier-price')?.textContent,
}));
M.footerPricing = await page.evaluate(() => !!document.querySelector('.sitefoot'));
await page.click('.tier >> nth=2 >> .tier-go');
await page.waitForTimeout(1500);
M.handoff = await page.evaluate(() => ({
  hash: window.location.hash,
  chip: document.querySelector('.page > p.pill-ghost')?.textContent ?? null,
}));

// renamed routes render with footer; old routes 404 to enter
for (const r of ['about', 'features', 'pricing', 'demo']) {
  await page.goto(`${URL}#/${r}`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  M['route_' + r] = await page.evaluate(() => ({
    title: document.querySelector('.page-title')?.textContent,
    footer: !!document.querySelector('.sitefoot'),
    rail: document.querySelectorAll('.ruler').length,
  }));
}
for (const bad of ['#/worlds', '#/worlds/reactor', '#/vision', '#/services', '#/contact']) {
  await page.goto(`${URL}${bad}`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  M['gone_' + bad.replace(/[^a-z]/gi, '')] = await page.evaluate(() => window.location.hash);
}

// booking form mirrors the briefing room
await page.goto(`${URL}#/demo`, { waitUntil: 'load' });
await page.waitForTimeout(800);
M.booking = await page.evaluate(() => ({
  focus: document.querySelectorAll('[aria-label="Demo focus"] button').length,
  slots: document.querySelectorAll('[aria-label="Demo slot"] button').length,
}));

// mobile menu carries the same model
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

// reduced motion still renders everything statically
const rctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
const t4 = await rctx.newPage();
t4.on('pageerror', (e) => errors.push('reduced:' + String(e)));
await t4.goto(`${URL}#/enter`, { waitUntil: 'load' });
await t4.waitForTimeout(2000);
M.reduced = await t4.evaluate(() => ({
  journey: document.querySelectorAll('.st-scroll > section').length,
  footer: !!document.querySelector('.sitefoot'),
}));
await rctx.close();

M.errors = errors;
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
