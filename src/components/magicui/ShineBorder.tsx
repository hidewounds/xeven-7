import type { CSSProperties, ReactNode, Ref } from 'react'
import './shine-border.css'

type Props = {
  children: ReactNode
  borderWidth?: number
  radius?: number
  duration?: number
  shineColor?: string | string[]
  className?: string
  contentClassName?: string
  style?: CSSProperties
  ref?: Ref<HTMLDivElement>
}

/* ShineBorder — Magic UI "shine-border" pattern (magicuidesign/magicui, MIT)
 * adapted to this codebase: plain CSS + XEVEN tokens, no Tailwind, no motion
 * dependency. Decorative animated border; content slot stays a plain div.
 */
export default function ShineBorder({
  children,
  borderWidth = 1,
  radius = 14,
  duration = 14,
  shineColor = ['#9cf5d3', '#ff4d2e'],
  className = '',
  contentClassName = '',
  style,
  ref,
}: Props) {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor]
  return (
    <div
      ref={ref}
      className={`shine-border ${className}`.trim()}
      style={{ ...style, '--sb-w': `${borderWidth}px`, '--sb-r': `${radius}px`, '--sb-duration': `${duration}s` } as CSSProperties}
    >
      <div
        className="shine-border-glow"
        aria-hidden
        style={{
          background: `conic-gradient(from var(--sb-angle), transparent 0%, ${colors.join(', ')}, transparent 40%)`,
        }}
      />
      <div className={`shine-border-content ${contentClassName}`.trim()}>{children}</div>
    </div>
  )
}
