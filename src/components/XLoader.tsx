import { useEffect, useState } from 'react'

/* XLoader — the lone revolving X. CSS-only 1.1s spin, 900ms minimum dwell,
   fonts-aware, 3s failsafe, static under reduced motion. */

export function XMark() {
  return (
    <span
      aria-hidden="true"
      style={{
        fontFamily: 'var(--disp)',
        fontSize: 44,
        color: 'var(--bone)',
        display: 'inline-block',
        animation: 'xspin 1.1s linear infinite',
      }}
    >
      X
    </span>
  )
}

export default function XLoader({ onDone }: { onDone: () => void }) {
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const t0 = performance.now()
    let done = false
    const finish = () => {
      if (done) return
      done = true
      onDone()
    }
    const waitFonts = document.fonts ? document.fonts.ready : Promise.resolve()
    void waitFonts.then(() => {
      const wait = Math.max(0, 900 - (performance.now() - t0))
      window.setTimeout(finish, reduced ? 0 : wait)
    })
    const failsafe = window.setTimeout(finish, 3000)
    return () => window.clearTimeout(failsafe)
  }, [onDone, reduced])

  return (
    <div className="xload" role="status" aria-label="Loading">
      <XMark />
      <style>{`@keyframes xspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
