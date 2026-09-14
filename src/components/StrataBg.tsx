import { useEffect, useRef } from 'react'
import { createStrataBg, defaultStrataOpts } from './strata/archBg'
import { pulseStrataBloom } from './strata/strataPointer'

/* STRATA arch-field — the site background. 45° diamond lattice on a convex
 * cylinder (full bow on the index, flat + dimmed on subpages), black-panel
 * mesh with breathing shimmer, roaming quad cinema on a 7s clock, and the
 * shapeless cursor blob (native cursor stays native — energy follows motion
 * intensity, never position, drains to nothing at rest).
 *
 * Seamless-experience wiring (beyond the mock):
 * - route switches rebuild the tier AND fire a bloom pulse, knitting the
 *   450ms X switch veil to the field flash.
 * - scroll velocity kindles the field (handled inside, via xs.vel).
 * - idle sleep + hidden-tab pause live inside; the wrapper only owns
 *   mount/unmount + route rebuilds.
 */

const routeFromHash = (): string =>
  window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'enter'

export default function StrataBg() {
  const ref = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = ref.current
    const spawn = () =>
      createStrataBg(
        canvas,
        { ...defaultStrataOpts, showcase: routeFromHash() === 'enter' },
        () => undefined,
      )
    let destroy = spawn()
    const onHash = () => {
      destroy()
      destroy = spawn()
      // bloom pulse lands under the X switch veil as it lifts
      pulseStrataBloom()
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      destroy()
    }
  }, [])

  return <canvas ref={ref} className="strata-fixed" aria-hidden="true" />
}
