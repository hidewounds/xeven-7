import type { Route } from '../app/store'

/* FieldMark — the floating route wordmark (XEVEN / WORLDS / …). A fixed
   HTML/SVG overlay, pixel-locked to the viewport: it never scrolls, bobs,
   or drifts with the WebGL camera. Hollow outline; gradient stroke on
   index, bright cyan on subpages. Decorative — screen readers ignore it. */

const LABELS: Record<Route, string> = {
  enter: 'XEVEN',
  worlds: 'WORLDS',
  about: 'MANUAL',
  features: 'MOVES',
  pricing: 'WAGES',
  demo: 'BRIEFING',
}

export default function FieldMark({ route }: { route: Route }) {
  const hero = route === 'enter'
  return (
    <div className={`field-mark${hero ? ' hero' : ' sub'}`} aria-hidden="true">
      <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid meet">
        {hero && (
          <defs>
            <linearGradient id="fm-g" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ff6fae" />
              <stop offset="0.55" stopColor="#f2a0c6" />
              <stop offset="1" stopColor="#4df3ff" />
            </linearGradient>
          </defs>
        )}
        <text
          x="600"
          y="195"
          textAnchor="middle"
          className="field-mark-text"
          stroke={hero ? 'url(#fm-g)' : '#4df3ff'}
        >
          {LABELS[route]}
        </text>
      </svg>
    </div>
  )
}
