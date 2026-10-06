export type Pose = {
  x: number;
  y: number;
  height: number;
  rx: number;
  ry: number;
  rz: number;
};
export type SceneSize = "desktop" | "tablet" | "phone";
export const SCENE_POSES: Record<SceneSize, Pose[]> = {
  desktop: [
    { x: 0.71, y: 0.54, height: 0.96, rx: 0.1, ry: -0.28, rz: -0.18 },
    { x: 0.77, y: 0.65, height: 1.55, rx: 0.05, ry: -0.16, rz: -0.27 },
    { x: 0.36, y: 0.62, height: 0.47, rx: 0.07, ry: 0.28, rz: 0.15 },
    { x: 0.48, y: 0.56, height: 0.64, rx: 0.04, ry: -0.2, rz: 0.1 },
  ],
  tablet: [
    { x: 0.79, y: 0.58, height: 0.6, rx: 0.08, ry: -0.24, rz: -0.15 },
    { x: 0.88, y: 0.66, height: 0.88, rx: 0.04, ry: -0.16, rz: -0.18 },
    { x: 0.75, y: 0.36, height: 0.44, rx: 0.06, ry: 0.18, rz: 0.12 },
    { x: 0.77, y: 0.41, height: 0.55, rx: 0.04, ry: -0.18, rz: 0.08 },
  ],
  phone: [
    { x: 0.55, y: 0.72, height: 0.43, rx: 0.08, ry: -0.24, rz: -0.17 },
    { x: 0.58, y: 0.74, height: 0.53, rx: 0.04, ry: -0.18, rz: -0.2 },
    { x: 0.51, y: 0.6, height: 0.37, rx: 0.04, ry: 0.2, rz: 0.13 },
    { x: 0.53, y: 0.65, height: 0.43, rx: 0.04, ry: -0.2, rz: 0.1 },
  ],
};
export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
export const mix = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;
export function poseAt(progress: number, size: SceneSize): Pose {
  const p = clamp(progress, 0, 3),
    index = Math.min(2, Math.floor(p));
  const fraction = p - index,
    t = fraction * fraction * (3 - 2 * fraction);
  const a = SCENE_POSES[size][index],
    b = SCENE_POSES[size][index + 1];
  return {
    x: mix(a.x, b.x, t),
    y: mix(a.y, b.y, t),
    height: mix(a.height, b.height, t),
    rx: mix(a.rx, b.rx, t),
    ry: mix(a.ry, b.ry, t),
    rz: mix(a.rz, b.rz, t),
  };
}
export function chapterProgress(
  scroll: number,
  sectionStarts: number[],
): number {
  if (scroll <= sectionStarts[0]) return 0;
  for (let index = 0; index < sectionStarts.length - 1; index++) {
    if (scroll < sectionStarts[index + 1])
      return (
        index +
        clamp(
          (scroll - sectionStarts[index]) /
            Math.max(1, sectionStarts[index + 1] - sectionStarts[index]),
        )
      );
  }
  return 3;
}
