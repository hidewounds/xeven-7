/* Cursor blob — a shapeless presence, not an object. While the finger moves
 * it smears into an irregular drifting mass with no boundary and no centre
 * you can point at; the moment motion stops it drains away completely and
 * the grid sits untouched. One persistent pool: a weak spring loosely
 * couples particles to the finger while strong curl wander tears any shape
 * apart, and energy follows motion intensity — not position — so nothing
 * ever regroups into a resting blob. Drawn only as flat butt-capped
 * streaks along each particle's own travel. Monochrome by design.
 */

interface P {
  x: number
  y: number
  vx: number // px per 60fps frame
  vy: number
  e: number // energy 0..1
}

const COUNT = 110
const REACH = 260 // px — presence thins past this distance

export class CursorBlob {
  private ps: P[] = []
  private placed = false

  reset(x: number, y: number): void {
    this.ps = []
    for (let i = 0; i < COUNT; i++) {
      this.ps.push({
        x: x + (Math.random() - 0.5) * 90,
        y: y + (Math.random() - 0.5) * 90,
        vx: 0,
        vy: 0,
        e: 0,
      })
    }
    this.placed = true
  }

  update(
    dtms: number,
    cx: number,
    cy: number,
    inside: boolean,
    tSec: number,
    speed: number,
  ): void {
    if (!this.placed) {
      if (!inside) return
      this.reset(cx, cy)
    }
    const k = Math.min(1.6, dtms / 16.7)
    // motion intensity — the only thing that feeds energy; stillness starves
    const drive = inside ? Math.min(1, speed * 1.15) : 0
    for (const p of this.ps) {
      const dx = cx - p.x
      const dy = cy - p.y
      const d = Math.hypot(dx, dy)
      // loose leash — coupled enough to follow, weak enough to never ball up
      p.vx = (p.vx + dx * 0.009 * k) * Math.pow(0.93, k)
      p.vy = (p.vy + dy * 0.009 * k) * Math.pow(0.93, k)
      // heavy curl tears any forming shape apart
      const curl =
        Math.sin(p.x * 0.017 + tSec * 2.6) * Math.cos(p.y * 0.019 - tSec * 2.1)
      const curl2 =
        Math.cos(p.x * 0.008 - tSec * 1.4) * Math.sin(p.y * 0.011 + tSec * 1.9)
      p.vx += (curl * 0.5 + curl2 * 0.3) * k
      p.vy += (curl2 * 0.5 - curl * 0.3) * k
      p.x += p.vx * k
      p.y += p.vy * k
      const target = drive * Math.min(1, Math.max(0, 1.2 - d / REACH))
      p.e += (target - p.e) * Math.min(1, dtms * 0.009)
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'butt'
    for (const p of this.ps) {
      const f = p.e
      if (f <= 0.02) continue
      const a = 0.13 * f * f + 0.02 * f
      if (a <= 0.003) continue
      const tx = p.x - p.vx * 8
      const ty = p.y - p.vy * 8
      ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`
      ctx.lineWidth = 0.7 + 1.9 * f
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(tx, ty)
      ctx.stroke()
    }
    ctx.restore()
  }
}
