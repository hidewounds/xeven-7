import { useEffect, useRef } from 'react'
import type { Route } from './chrome'

/* persistent HUD frame: corner brackets + live route/scroll readout */
export function Hud({ route }: { route: Route }) {
  const pct = useRef<HTMLSpanElement>(null!)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, window.scrollY / max))
      if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [route])
  return (
    <div className="hud" aria-hidden="true">
      <span className="hud-corner tl" />
      <span className="hud-corner tr" />
      <span className="hud-corner bl" />
      <span className="hud-corner br" />
      <span className="hud-read">
        XVN·SYS // {route.toUpperCase()} — <span ref={pct}>000</span>%
      </span>
    </div>
  )
}
