import { useRef, useState } from 'react'
import { navigate } from '../app/store'
import ArcadeOrb from '../components/ArcadeOrb'

export default function EntryGate() {
  const [entering, setEntering] = useState(false)
  const timer = useRef<number | null>(null)
  const enter = () => {
    if (entering) return
    setEntering(true)
    timer.current = window.setTimeout(() => navigate('index'), 1500)
  }

  return (
    <div className={`entry-page${entering ? ' is-entering' : ''}`}>
      <div className="entry-constellation" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <header className="entry-masthead"><a className="entry-wordmark" href="#/entry">XEVEN<span>/</span></a><span><b /> SYSTEM ONLINE</span><small>XP-07 / 2026</small></header>
      <main className="entry-composition">
        <section className="entry-copy" aria-labelledby="entry-title"><p className="mono">A PORTFOLIO IN MOTION <span>↗</span></p><h1 id="entry-title">Make<br /><em>some noise.</em></h1><p className="entry-lede">Digital worlds, sharp ideas,<br />and the space between them.</p></section>
        <section className="arcade-hero" aria-label="XEVEN arcade portal">
          <div className="arcade-aura" aria-hidden="true" />
          <div className="arcade-cabinet">
            <div className="arcade-topline" />
            <div className="arcade-bezel"><div className="arcade-screen"><div className="crt-grid" aria-hidden="true" /><div className="crt-scan" aria-hidden="true" /><div className="screen-meta mono"><span>INSERT PRESENCE</span><span>01</span></div><ArcadeOrb /><div className="screen-reflection" aria-hidden="true" /></div></div>
            <div className="arcade-deck"><span className="joystick" aria-hidden="true"><i /></span><span className="arcade-buttons" aria-hidden="true"><i /><i /><i /></span><small>XEVEN / NIGHTSHIFT</small></div>
            <div className="arcade-footer mono"><span>XP-07</span><span>EST. 2003</span></div>
          </div>
          <div className="portal-orb" aria-hidden="true"><ArcadeOrb /></div>
        </section>
        <section className="entry-cta"><p className="mono">OPEN THE INDEX <span>↓</span></p><button className="entry-enter" onClick={enter} disabled={entering} data-cursor="INDEX"><span className="entry-ring" /><span>{entering ? 'OPEN' : 'INDEX'}</span><b>↗</b></button></section>
      </main>
      <footer className="entry-baseline mono"><span>SCROLL TO CALIBRATE</span><i /><span>SOUND OPTIONAL · VOLUME 01</span></footer>
      <a className="entry-skip" href="#/index" onClick={(e) => { e.preventDefault(); navigate('index') }}>Skip intro ↗</a>
    </div>
  )
}
