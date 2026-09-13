import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/* GSAP curtain wipe for route transitions. */

export const curtainBus: { play?: (cb: () => void) => void } = {}

export function Curtain() {
  const root = useRef<HTMLDivElement>(null!)
  const busy = useRef(false)

  useEffect(() => {
    curtainBus.play = (cb: () => void) => {
      if (busy.current || !root.current) {
        cb()
        return
      }
      busy.current = true
      const tl = gsap.timeline({
        onComplete: () => {
          busy.current = false
        },
      })
      tl.set(root.current, { display: 'block' })
        .fromTo(
          '.curtain-panel',
          { scaleY: 0 },
          { scaleY: 1, duration: 0.45, ease: 'expo.in', transformOrigin: 'bottom', stagger: 0.06 },
        )
        .add(() => cb())
        .to('.curtain-panel', {
          scaleY: 0,
          duration: 0.6,
          ease: 'expo.out',
          transformOrigin: 'top',
          stagger: 0.06,
        })
        .set(root.current, { display: 'none' })
    }
    return () => {
      curtainBus.play = undefined
    }
  }, [])

  return (
    <div ref={root} className="curtain" style={{ display: 'none' }} aria-hidden="true">
      <div className="curtain-panel" />
      <div className="curtain-panel curtain-ember" />
    </div>
  )
}
