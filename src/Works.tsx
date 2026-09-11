import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BgState } from './scroll-state'
import './Works.css'

gsap.registerPlugin(ScrollTrigger)

export type Work = { date: string; title: string; ja: string; tags: string[]; seed: string }

export const WORKS: Work[] = [
  { date: '2026 01.17', title: 'KizunaAI "Hello, Fortnite"', ja: 'KizunaAI “Hello, Fortnite”', tags: ['In-Game-Concert', 'fortnite', 'metaverse'], seed: 'alche1' },
  { date: '2025 05.16', title: 'WEAR GO LAND', ja: '15ブランド以上が参加、「IS:SUE」がアンバサダーに就任', tags: ['stellla', 'unreal_engine', 'metaverse', 'mobile'], seed: 'alche2' },
  { date: '2025 02.20', title: 'DISCOAT 2025SS EXHIBITION in virtual', ja: '人気ブランドDISCOATのファッションショーを開催', tags: ['stellla', 'unreal_engine', 'metaverse', 'cloud rendering'], seed: 'alche3' },
  { date: '2024 10.18', title: 'Matsuken Samba II Rise Up the World', ja: 'マツケンサンバII / 3000万PV突破', tags: ['fortnite', 'metaverse', 'In-Game-Concert'], seed: 'alche4' },
  { date: '2024 07.29', title: 'run for money CREATED IN FORTNITE', ja: '逃走中 / 同時接続人数世界Top3 (2.2万人)', tags: ['fortnite', 'metaverse'], seed: 'alche5' },
  { date: '2021 07.16', title: 'RADWIMPS ROLE PLAYING MUSIC', ja: 'SHIN SEKAI “nowhere” / リアルとヴァーチャルを行き来する音楽体験', tags: ['metaverse', 'unreal_engine', 'mobile', 'In-Game-Concert'], seed: 'alche6' },
]

export default function Works({ bg }: { bg: BgState }) {
  const root = useRef<HTMLElement>(null!)
  const items = useRef<(HTMLDivElement | null)[]>([])
  const thumbs = useRef<(HTMLImageElement | null)[]>([])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const setActive = (idx: number) => {
        items.current.forEach((el, i) => {
          if (!el) return
          el.style.opacity = i === idx ? '1' : '0.25'
        })
        thumbs.current.forEach((el, i) => {
          if (!el) return
          const on = i === idx
          el.style.opacity = on ? '1' : '0'
          el.style.transform = on
            ? 'translate(-50%,-50%) scale(1)'
            : 'translate(-50%,-50%) scale(0.9) translateY(100px)'
        })
      }
      setActive(0)
      let last = 0
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=500%',
        pin: true,
        anticipatePin: 1,
        scrub: 1,
        snap: {
          snapTo: [0, 0.2, 0.4, 0.6, 0.8, 1],
          duration: { min: 0.1, max: 0.5 },
          delay: 0.1,
          ease: 'power1.inOut',
        },
        onUpdate: (self) => {
          const i = Math.min(WORKS.length - 1, Math.floor(self.progress * WORKS.length))
          bg.progress = self.progress
          bg.velocity = self.getVelocity() / 1000
          bg.active = i
          if (i !== last) {
            last = i
            bg.pulse += 1
          }
          setActive(i)
        },
      })
      gsap.to('.works-stage', {
        scale: 1.05,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=500%', scrub: 1 },
      })
    }, root)
    return () => ctx.revert()
  }, [bg])

  return (
    <section ref={root} id="works" className="works">
      <div className="works-sticky">
        <div className="works-list">
          {WORKS.map((w, i) => (
            <div
              key={w.seed}
              ref={(el) => {
                items.current[i] = el
              }}
              className="work-item"
            >
              <p className="work-date">{w.date}</p>
              <h3>{w.title}</h3>
              <p className="work-ja">{w.ja}</p>
              <ul className="work-pills">
                {w.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="works-stage">
          {WORKS.map((w, i) => (
            <img
              key={w.seed}
              ref={(el) => {
                thumbs.current[i] = el
              }}
              className="work-thumb"
              src={`https://picsum.photos/seed/${w.seed}/800/450`}
              alt={w.title}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
