import { useEffect, useRef, useState } from 'react'

/* Gate — the THINKING ORB intro (index fresh loads only). A living creature:
   bubblegum-pink body, radiant-cyan glowing insides, stretchy squash-and-
   swell on a slow revolve. At 100 it stretches to the four corners, floods
   the screen pink, and that flood IS the index reveal. Click skips straight
   to the stretch. Hook classes (.intro/.intro-stage/.intro-count) kept for
   the capture rig. Reduced motion: still orb, fast exit. */

const WORDS = ['WAKING', 'STRETCHING', 'OPENING']

export default function Gate({ onEnter }: { onEnter: () => void }) {
  const done = useRef(false)
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [n, setN] = useState(() => (reduced ? 100 : 0))
  const [wi, setWi] = useState(0)
  const [cover, setCover] = useState(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    onEnter()
  }

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(finish, 400)
      return () => window.clearTimeout(t)
    }
    const t0 = performance.now()
    let raf = 0
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 2100)
      setN(Math.floor(p * 100))
      setWi(Math.min(WORDS.length - 1, Math.floor(p * WORDS.length)))
      if (p >= 1) {
        setCover(true)
        window.setTimeout(finish, 480)
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <div
      className={`intro orb-intro${cover ? ' cover' : ''}`}
      onClick={() => {
        if (!cover) {
          setCover(true)
          setN(100)
          window.setTimeout(finish, reduced ? 0 : 480)
        }
      }}
      role="button"
      aria-label="Enter the site"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !cover) {
          setCover(true)
          setN(100)
          window.setTimeout(finish, reduced ? 0 : 480)
        }
      }}
    >
      <div className="intro-stage orb-stage">
        <div className="orb-creature" aria-hidden="true">
          <div className="orb-revolve">
            <div className="orb-stretch">
              <div className="orb-core" />
            </div>
          </div>
        </div>
        <p className="intro-count">
          {String(n).padStart(3, '0')} — {WORDS[wi]}
        </p>
      </div>
    </div>
  )
}
