// LIVE smoke: wait for the production alias to serve the pushed commit, then
// run the alt-stack checks against it. Polls up to ~18 min for the deploy.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.LIVE_URL || 'https://xeven-7.vercel.app';
const OUT = 'D:\\xeven-web\\verify\\alt-stack';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const M = { url: URL };

let ready = false;
for (let i = 1; i <= 36; i++) {
  const probe = await browser.newPage();
  try {
    // new-build marker: worlds stations exist only in the SHIFT rebuild
    await probe.goto(`${URL}/#/worlds`, { waitUntil: 'load', timeout: 30000 });
    await probe.waitForTimeout(3000);
    ready = await probe.evaluate(() => document.querySelectorAll('.station').length === 3);
    console.log(`try ${i}: stations=${ready}`);
    if (ready) { await probe.close(); break; }
  } catch (e) {
    console.log(`try ${i}: ${String(e).split('\n')[0]}`);
  }
  await probe.close().catch(() => {});
  await new Promise((r) => setTimeout(r, 30000));
}
if (!ready) {
  M.deployTimeout = true;
  writeFileSync(`${OUT}/e4-live.json`, JSON.stringify(M, null, 2));
  console.log(JSON.stringify(M));
  await browser.close();
  process.exit(2);
}

const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

await page.goto(`${URL}/#/about`, { waitUntil: 'load' });
try { await page.waitForSelector('.field-study canvas', { timeout: 25000 }); } catch {}
await page.waitForTimeout(2000);
M.about = await page.evaluate(() => ({
  canvas: !!document.querySelector('.field-study canvas'),
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await page.screenshot({ path: `${OUT}/e4-live-about.png` });

await page.goto(`${URL}/#/demo`, { waitUntil: 'load' });
await page.waitForTimeout(2000);
M.demo = await page.evaluate(() => ({
  shine: !!document.querySelector('.shine-ring'),
  inputs: document.querySelectorAll('.form-card input').length,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await page.screenshot({ path: `${OUT}/e4-live-demo.png` });

await page.goto(`${URL}/#/worlds`, { waitUntil: 'load' });
await page.waitForTimeout(2000);
M.worlds = await page.evaluate(() => ({
  stations: document.querySelectorAll('.station').length,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await page.screenshot({ path: `${OUT}/e4-live-worlds.png` });

await page.goto(`${URL}/#/playground`, { waitUntil: 'load' });
await page.waitForTimeout(2000);
M.playground = await page.evaluate(() => ({
  bot: !!document.querySelector('.pg-transcript .msg.bot'),
  composer: !!document.querySelector('.pg-composer input'),
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await page.screenshot({ path: `${OUT}/e4-live-playground.png` });

M.errors = errors;
writeFileSync(`${OUT}/e4-live.json`, JSON.stringify(M, null, 2));
console.log(JSON.stringify(M, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;
