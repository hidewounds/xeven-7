// FIELD RECORDING: capture the live About R3F vignette canvas to a local
// webm (vp9) via captureStream + MediaRecorder. Real timers, headless Edge
// with swiftshader (CPU GL — frames will be coarse; judge the output before
// wiring it anywhere).
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5500';
const OUT = 'D:\\xeven-web\\public';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`${URL}/#/about`, { waitUntil: 'load' });
await page.waitForSelector('.field-study canvas', { timeout: 25000 });
await page.evaluate(() => document.querySelector('.field-study')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(2000);

const bytes = await page.evaluate(async () => {
  const canvas = document.querySelector('.field-study canvas');
  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 2_500_000 });
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const done = new Promise((res) => { rec.onstop = res; });
  rec.start(250);
  await new Promise((r) => setTimeout(r, 5000));
  rec.stop();
  await done;
  const buf = await new Blob(chunks, { type: 'video/webm' }).arrayBuffer();
  return Array.from(new Uint8Array(buf));
});
writeFileSync(`${OUT}/field-recording.webm`, Buffer.from(bytes));
console.log(JSON.stringify({ bytes: bytes.length, errors }));
await browser.close();
if (errors.length) process.exitCode = 1;
