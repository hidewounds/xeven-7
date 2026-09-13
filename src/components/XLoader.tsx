import { useEffect, useState } from 'react'

/* Boot loader for non-enter refreshes: a lone revolving X on the void.
   No progress bar, no percentage — it simply revolves until the site is
   ready, then fades. Under reduced motion the X sits static. */

export default function XLoader({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let live = true
    const timers: number[] = []
    const leave = () => {
      if (!live) return
      setLeaving(true)
      timers.push(
        window.setTimeout(() => {
          if (!live) return
          setGone(true)
          onDone()
        }, 320),
      )
    }
    // minimum dwell so the X reads instead of flickering
    timers.push(window.setTimeout(leave, 900))
    // boot with the type, not before it
    if (document.fonts) {
      void document.fonts.ready.then(() => {
        if (live) timers.push(window.setTimeout(leave, 450))
      })
    }
    // failsafe — never trap the visitor behind the veil
    timers.push(window.setTimeout(leave, 3000))
    return () => {
      live = false
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [onDone])

  if (gone) return null
  return (
    <div className={leaving ? 'xload xload-done' : 'xload'} role="status" aria-label="Loading site">
      <svg viewBox="0 0 48 48" className="xload-x" aria-hidden="true">
        <path d="M11 11 L37 37 M37 11 L11 37" stroke="currentColor" strokeWidth={6} strokeLinecap="round" fill="none" />
      </svg>
    </div>
  )
}
