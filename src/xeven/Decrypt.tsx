import { useEffect, useRef, useState } from 'react'

const GLYPHS = '█▓▒░<>/\\|[]{}=+*#01'

/** Machine-decrypt reveal: gibberish resolves left-to-right when scrolled into view. */
export default function Decrypt({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null!)
  const [out, setOut] = useState(text.replace(/[^ ]/g, '░'))
  useEffect(() => {
    let raf = 0
    let started = false
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting && !started) {
          started = true
          const t0 = performance.now()
          const dur = 700 + text.length * 18
          const step = (now: number) => {
            const p = Math.min(1, (now - t0) / dur)
            const n = Math.floor(p * text.length)
            let s = ''
            for (let i = 0; i < text.length; i++) {
              if (text[i] === ' ') s += ' '
              else if (i < n) s += text[i]
              else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            }
            setOut(s)
            if (p < 1) raf = requestAnimationFrame(step)
            else setOut(text)
          }
          raf = requestAnimationFrame(step)
        }
      },
      { threshold: 0.4 },
    )
    io.observe(ref.current)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [text])
  return (
    <span ref={ref} className={className}>
      {out}
    </span>
  )
}
