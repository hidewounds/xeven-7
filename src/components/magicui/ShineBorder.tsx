import type { CSSProperties } from 'react'
import './shine-border.css'

type Props = {
  duration?: number
  shineColor?: string | string[]
  thickness?: number
  className?: string
  style?: CSSProperties
}

/* ShineBorder — Magic UI "shine-border" pattern (magicuidesign/magicui, MIT)
 * as an overlay ring: render it inside any positioned container and it traces
 * the container's own border-radius (inherit), painting only a masked 1px
 * ring. Translucent card veils stay clean — nothing washes through.
 * Decorative, pointer-transparent, still under reduced motion. */
export default function ShineBorder({
  duration = 14,
  shineColor = ['#4df3ff', '#ff6fae'],
  thickness = 1,
  className = '',
  style,
}: Props) {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor]
  return (
    <div
      aria-hidden="true"
      className={`shine-ring ${className}`.trim()}
      style={{
        ...style,
        '--sb-w': `${thickness}px`,
        '--sb-duration': `${duration}s`,
        background: `conic-gradient(from var(--sb-angle), transparent 0%, ${colors.join(', ')}, transparent 40%)`,
      } as CSSProperties}
    />
  )
}
