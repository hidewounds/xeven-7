// Burst capture: serves G:\mocks\animations, bakes the full 8M sticks,
// turns the turntable on, hides the study UI, and grabs a PNG sequence
// for the ffmpeg ping-pong loop. One-off footage run.
import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync } from 'node:fs';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROOT = 'G:\\mocks\\animations';
const OUT = 'G:\\xeven-web\\verify\\burst';
mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer(async (req, res) => {
  try {
    const data = await readFile(join(ROOT, decodeURIComponent(req.url.split('?')[0])));
    res.writeHead(200, { 'Content-Type': MIME[extname(req.url)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('no');
  }
});
await new Promise((res) => server.listen(8123, '127.0.0.1', res));

const EDGE = process.env.EDGE_BIN || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
await page.goto('http://127.0.0.1:8123/xeven-burst.html', { waitUntil: 'load' });
// wait for the full 8M bake (auto at +1200ms; drafting is the long pole)
await page.waitForFunction(
  () => (document.getElementById('stats')?.textContent || '').includes('FINAL 8M'),
  null,
  { timeout: 600000 },
);
// turntable on, study chrome off (DOM click: the panel sits off-viewport
// at capture size, so synthetic clicks can't reach it)
await page.evaluate(() => document.getElementById('bTurn').click());
await page.addStyleTag({
  content: '.top,.panel,.bot,.hint,.tip,#loader{display:none!important}.vig{display:block}',
});
await page.waitForTimeout(2500);
const have = readdirSync(OUT).filter((f) => f.endsWith('.png')).length;
for (let i = have; i < 48; i++) {
  await page.screenshot({ path: `${OUT}/f${String(i).padStart(3, '0')}.png` });
  await page.waitForTimeout(400);
}
console.log('captured 48');
await browser.close();
server.close();
