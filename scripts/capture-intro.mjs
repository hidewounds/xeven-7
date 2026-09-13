// XEVEN frozen-frame verifier. Captures the intro (and any route) at fixed
// timestamps via headless Edge virtual time, so animation rounds are judged
// on pixels, never on memory.
// Usage:
//   npm run verify:intro            (desktop 1600x900, draw/morph/fall/flood)
//   npm run verify:intro -- mobile  (390x844 sanity + reduced-motion index)
// Requires the preview server on :5000 (it is WMI-persistent, relaunch if dead).
// Edge path override: set EDGE_BIN env var.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const EDGE =
  process.env.EDGE_BIN ||
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'C:\\Users\\dhana\\AppData\\Local\\Temp\\opencode\\verify';
const URL = process.env.XEVEN_URL || 'http://127.0.0.1:5000/';
const mode = process.argv[2] || 'desktop';

const shots =
  mode === 'mobile'
    ? [
        { name: 'm-enter', budget: 6000, w: 390, h: 844, extra: [] },
        { name: 'm-reduced', budget: 2500, w: 390, h: 844, extra: ['--force-prefers-reduced-motion'] },
      ]
    : [
        { name: 'intro-white', budget: 300, w: 1600, h: 900, extra: [] },
        { name: 'intro-grid', budget: 800, w: 1600, h: 900, extra: [] },
        { name: 'intro-mass', budget: 1700, w: 1600, h: 900, extra: [] },
        { name: 'intro-wash', budget: 2500, w: 1600, h: 900, extra: [] },
        { name: 'index', budget: 4200, w: 1600, h: 900, extra: [] },
      ];

mkdirSync(OUT, { recursive: true });
for (const s of shots) {
  const file = path.join(OUT, `${s.name}.png`);
  try {
    execFileSync(
      EDGE,
      [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        `--window-size=${s.w},${s.h}`,
        `--virtual-time-budget=${s.budget}`,
        `--screenshot=${file}`,
        ...s.extra,
        URL,
      ],
      { stdio: 'ignore', timeout: 90000 },
    );
    console.log('captured', file);
  } catch (err) {
    console.error('FAILED', s.name, err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}
