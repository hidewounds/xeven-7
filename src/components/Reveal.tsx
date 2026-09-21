import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { xs } from '../app/store'

gsap.registerPlugin(ScrollTrigger)

/* Reveal — the one scroll entrance. Compositor-only, fires once at 88%.
   Reduced motion (or no JS animation) renders the final state directly. */

export default function Reveal({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' | 'li' | 'span' }) {
  const ref = useRef<HTMLDivElement>(null!)
  useEffect(() => {
    if (xs.reduced) return
    const el = ref.current
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [])
  // @ts-expect-error polymorphic tag ref
  return <Tag ref={ref} className={className}>{children}</Tag>
}
