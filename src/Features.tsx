import { INSTRUMENTS, TELEMETRY } from './data'
import { CtaBand, Fade, Rise } from './fx'

const TAGS = [
  ['realtime', '24/7'],
  ['per-customer', 'scoped'],
  ['ranked', 'held'],
  ['mic + phone', '100 langs'],
  ['keyword', 'semantic'],
]
import { ChatDemo } from './chat'

export function Features() {
  return (
    <>
      <section className="sec" style={{ paddingTop: '22vh' }}>
        <div className="wrap">
          <Fade>
            <p className="kicker">XEVEN // FIVE INSTRUMENTS</p>
          </Fade>
          <h1 className="giant">
            <Rise>Don&apos;t read features.</Rise>
            <Rise shift={5}>Play them.</Rise>
          </h1>
          <Fade shift={4}>
            <p className="lede">
              Every station below is the capability itself. Situation, knowledge, memory and
              behavior fuse before a word is written.
            </p>
          </Fade>
          <div>
            {INSTRUMENTS.map((f, fi) => (
              <article className="inst" key={f.n} id={f.id}>
                <span className="mono dim">{f.n}</span>
                <div>
                  <h3>
                    {f.t} — <em>{f.s}</em>
                  </h3>
                  <p>{f.d}</p>
                  <div className="tagrow">
                    {TAGS[fi].map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="inst-stat">{f.stat}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Fade>
            <p className="kicker">TELEMETRY — WHAT XEVEN OPERATES</p>
          </Fade>
          <div className="tele">
            {TELEMETRY.map((t) => (
              <div className="tele-cell" key={t.n}>
                <span className="mono dim">{t.n}</span>
                <h4>{t.t}</h4>
                <p>{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChatDemo
        script="book"
        compact
        kicker="CHRONO // LIVE BOOKING"
        title={
          <>
            Slots that <em>hold.</em>
          </>
        }
      />

      <CtaBand
        title={
          <>
            Hear it <em>on your site.</em>
          </>
        }
        sub="Paste one snippet. See revenue, not demos."
        primary={{ label: 'Start free trial →', href: '#/pricing' }}
      />
    </>
  )
}
