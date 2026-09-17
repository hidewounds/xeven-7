// Liquid probe: mid-motion capture (glass flowing) + settled capture.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500/#/enter';
const OUT = 'G:\\xeven-web\\verify\\world';
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(1100);
try { await page.click('.intro', { timeout: 4000 }); } catch {}
try { await page.waitForSelector('.intro', { state: 'detached', timeout: 20000 }); } catch {}
await page.waitForSelector('canvas.world-fixed', { timeout: 20000 });
await page.waitForTimeout(2000);
await page.mouse.move(300, 650);
for (let x = 300; x <= 1300; x += 100) {
  await page.mouse.move(x, x % 200 ? 350 : 600, { steps: 2 });
}
await page.screenshot({ path: `${OUT}/probe-liquid.png` });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/probe-settled.png` });
console.log(JSON.stringify({ errors: errors.length }));
await browser.close();
if (errors.length) process.exitCode = 1;
