/* Raw cursor feed — the cursor itself stays native and untouched; position
 * is pipelined as data for the scene to react to (buttermax pattern).
 * Element-relative UVs plus an inside sentinel so reactions ease out when
 * the finger leaves instead of freezing mid-gesture.
 */

export const strataPointer = {
  tx: typeof window === 'undefined' ? 0 : window.innerWidth / 2,
  ty: typeof window === 'undefined' ? 0 : window.innerHeight / 2,
  nx: 0.5, // cursor UV 0..1 across the viewport
  ny: 0.5,
  inside: true, // false = cursor gone
  bloom: 0, // click flash 1 → 0, decayed by the scene
}

let attached = false

export function initStrataPointer(): void {
  if (attached) return
  attached = true
  const move = (x: number, y: number) => {
    strataPointer.tx = x
    strataPointer.ty = y
    strataPointer.nx = window.innerWidth ? x / window.innerWidth : 0.5
    strataPointer.ny = window.innerHeight ? y / window.innerHeight : 0.5
    strataPointer.inside = true
  }
  window.addEventListener(
    'pointermove',
    (e: PointerEvent) => move(e.clientX, e.clientY),
    { passive: true },
  )
  window.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      move(e.clientX, e.clientY)
      strataPointer.bloom = 1
    },
    { passive: true },
  )
  const markGone = () => {
    strataPointer.inside = false
  }
  window.addEventListener('pointerleave', markGone, { passive: true })
  window.addEventListener('mouseout', markGone, { passive: true })
  window.addEventListener('blur', markGone)
}

/** Route-switch pulse: knits the X switch veil to the field. */
export function pulseStrataBloom(): void {
  strataPointer.bloom = 1
}
