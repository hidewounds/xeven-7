/* Motion vocabulary — one owner per value. Ranges from the experience
   plan: controls feel instant, panels deliberate, scene moves cinematic.
   The scroll heartbeat (scrub) is a single shared constant: every scrubbed
   timeline uses it, so the page moves at one tempo end to end. */

export const T = {
  /** small control feedback: 150–250ms */
  control: 0.2,
  /** panels and overlays: 250–450ms */
  panel: 0.4,
  /** major scene transitions: 600–1000ms */
  scene: 0.9,
  /** the one scroll heartbeat — every scrub uses this */
  scrub: 1.2,
  /** the one toggle easing */
  expo: 'expo.out',
} as const
