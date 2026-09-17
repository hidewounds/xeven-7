import { useEffect, useRef, useState } from 'react'

/* Video slot with procedural fallback. src is optional: without it the
   card is a poster study. preload="none", plays only in view,
   poster-only under reduced motion. */

export const PH = {
  ink: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  aerial: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  chrome: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  head: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  metal: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
}

export default function VideoCard({ src, title, sub, poster }: { src?: string; title: string; sub?: string; poster?: string }) {
  const vref = useRef<HTMLVideoElement>(null!)
  const wrap = useRef<HTMLDivElement>(null!)
  const seeing = useRef(false)
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const v = vref.current
    if (!v || reduced || !wrap.current) return
    const io = new IntersectionObserver(
      ([entry]) => {
        seeing.current = entry.isIntersecting
        if (document.hidden) return
        if (entry.isIntersecting) void v.play().catch(() => undefined)
        else v.pause()
      },
      { threshold: 0.25 },
    )
    // hidden tabs keep decoding otherwise — pause, resume only if in view
    const onVis = () => {
      if (document.hidden) v.pause()
      else if (seeing.current) void v.play().catch(() => undefined)
    }
    document.addEventListener('visibilitychange', onVis)
    io.observe(wrap.current)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      io.disconnect()
    }
  }, [reduced])

  return (
    <div ref={wrap} className="vid" data-cursor>
      <div className="vid-fallback" aria-hidden="true" />
      {poster && <img className="vid-poster" src={poster} alt="" aria-hidden="true" loading="lazy" />}
      {src && !reduced && <video ref={vref} src={src} poster={poster} muted loop playsInline preload="none" />}
      <div className="vid-meta">
        <p>{title}</p>
        {sub ? <span>{sub}</span> : null}
      </div>
    </div>
  )
}
