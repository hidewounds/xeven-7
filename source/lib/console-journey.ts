/** Measured display opening in the retained 1024 × 1536 console artwork. */
export const DISPLAY = {
  left: 0.142,
  top: 0.097,
  width: 0.716,
  height: 0.399,
  aspect: 1.5,
} as const;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const p = clamp01(v);
  return p * p * (3 - 2 * p);
};
const progress = (value: number, start: number, end: number) =>
  smooth((value - start) / Math.max(0.000001, end - start));
export type ConsolePose = {
  x: number;
  y: number;
  width: number;
  rx: number;
  ry: number;
  rz: number;
};
export type JourneyMetrics = {
  heroEnd: number;
  returnStart: number;
  footerStart: number;
};
export function displayRect(pose: ConsolePose) {
  const h = pose.width * DISPLAY.aspect;
  return {
    x: pose.x - pose.width * 0.5 + pose.width * DISPLAY.left,
    y: pose.y - h * 0.5 + h * DISPLAY.top,
    width: pose.width * DISPLAY.width,
    height: h * DISPLAY.height,
  };
}
const blend = (a: ConsolePose, b: ConsolePose, t: number): ConsolePose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  width: lerp(a.width, b.width, t),
  rx: lerp(a.rx, b.rx, t),
  ry: lerp(a.ry, b.ry, t),
  rz: lerp(a.rz, b.rz, t),
});
export function consoleFrame(
  scroll: number,
  w: number,
  h: number,
  m: JourneyMetrics,
) {
  const phone = w < 701;
  const entry = progress(scroll, h * 0.1, m.heroEnd - h * 0.18);
  const returning = progress(
    scroll,
    m.returnStart - h * 0.48,
    m.returnStart + h * 0.62,
  );
  const docking = progress(
    scroll,
    m.footerStart - h * 0.88,
    m.footerStart - h * 0.03,
  );
  const expansion = progress(
    scroll,
    m.footerStart + h * 0.03,
    m.footerStart + h * 0.82,
  );
  const coverWidth =
    Math.max(w / DISPLAY.width, h / (DISPLAY.aspect * DISPLAY.height)) * 1.09;
  const cover: ConsolePose = {
    x: w * 0.5,
    y:
      h * 0.5 +
      (0.5 - DISPLAY.top - DISPLAY.height * 0.5) * coverWidth * DISPLAY.aspect,
    width: coverWidth,
    rx: 0,
    ry: 0,
    rz: 0,
  };
  const openingWidth = phone
    ? Math.min(w * 0.72, h * 0.43)
    : Math.min(w * 0.43, h * 0.65);
  const opening: ConsolePose = {
    x: w * (phone ? 0.67 : 0.73),
    y: phone ? Math.max(h * 0.85, 420 + openingWidth * 0.75) : h * 0.57,
    width: openingWidth,
    rx: 5,
    ry: -14,
    rz: 10,
  };
  const returned: ConsolePose = {
    x: w * (phone ? 0.56 : 0.59),
    y: h * (phone ? 0.65 : 0.52),
    width: Math.min(w * (phone ? 0.69 : 0.38), h * 0.48),
    rx: 3,
    ry: 12,
    rz: -7,
  };
  const dock: ConsolePose = {
    x: w * (phone ? 0.77 : 0.845),
    y: h * (phone ? 0.3 : 0.57),
    width: Math.min(w * (phone ? 0.39 : 0.245), h * (phone ? 0.32 : 0.55)),
    rx: 0,
    ry: 0,
    rz: 0,
  };
  let pose = blend(opening, cover, entry);
  pose = blend(pose, returned, returning);
  pose = blend(pose, dock, docking);
  const screen = displayRect(pose);
  const gutter = phone ? 12 : Math.max(28, w * 0.035);
  const expanded = {
    x: gutter,
    y: phone ? 78 : 92,
    width: w - gutter * 2,
    height: Math.max(400, h - (phone ? 96 : 116)),
  };
  const projection = {
    x: lerp(screen.x, expanded.x, expansion),
    y: lerp(screen.y, expanded.y, expansion),
    width: lerp(screen.width, expanded.width, expansion),
    height: lerp(screen.height, expanded.height, expansion),
  };
  return {
    pose,
    screen,
    projection,
    entry,
    returning,
    docking,
    expansion,
    inside: entry * (1 - returning),
    heroOpacity: 1 - progress(entry, 0.08, 0.78),
    contentOpacity:
      progress(entry, 0.64, 1) * (1 - progress(returning, 0, 0.6)),
    footerOpacity: progress(expansion, 0.25, 0.8),
    phase:
      expansion > 0
        ? "footer"
        : docking > 0
          ? "docking"
          : returning > 0
            ? "return"
            : entry >= 0.999
              ? "inside"
              : "enter",
  };
}
