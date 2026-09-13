// Buttermax intro study: records the live homepage via CDP screencast at
// native frame rate into JPEGs for beat analysis. Original-study only —
// no assets, copy, or code are reused; the XEVEN intro will be original.
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = 'C:\\Users\\dhana\\AppData\\Local\\Temp\\opencode\\butter';
const URL = 'https://buttermax.net/';
const MAX = 420; // ~7s at 60fps
const RECORD_MS = 11000;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
  args: ['--hide-scrollbars', '--mute-audio'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const cdp = await page.context().newCDPSession(page);

let n = 0;
let done = false;
cdp.on('Page.screencastFrame', ({ data, sessionId }) => {
  if (!done && n < MAX) {
    writeFileSync(path.join(OUT, `frame-${String(n).padStart(4, '0')}.jpg`), Buffer.from(data, 'base64'));
    n++;
  }
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => undefined);
});

await cdp.send('Page.startScreencast', {
  format: 'jpeg',
  quality: 55,
  everyNthFrame: 1,
  maxWidth: 1280,
  maxHeight: 720,
});
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) => console.error('goto:', e?.message));
await page.waitForTimeout(RECORD_MS);
done = true;
await cdp.send('Page.stopScreencast').catch(() => undefined);
await browser.close();
console.log('frames captured:', n);
