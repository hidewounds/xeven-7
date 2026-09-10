import * as THREE from 'three'

export type ScreenMode =
  | 'boot'
  | 'terminal'
  | 'memory'
  | 'web'
  | 'pattern'
  | 'layers'
  | 'final'
  | 'demo'

const W = 512
const H = 600

const DEMO_ANSWERS: [RegExp, string][] = [
  [/size/i, 'You usually shop in size 42.'],
  [/view|looking|left off|continue/i, 'Still looking at gaming gear ~₹80K.'],
  [/recommend/i, 'Back in stock: your size 42.'],
  [/.*/s, 'Context found. Adapting experience.'],
]

/** CRT display: boot/terminal/memory/web morph/pattern modes/demo chat,
 *  scanline+pixel-grid overlay, noise, wipe transitions, faint ghost (CA). */
export class ScreenDriver {
  tex: THREE.CanvasTexture
  mode: ScreenMode = 'boot'
  glow = 0
  private cv: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private grid: HTMLCanvasElement
  private noise: HTMLCanvasElement
  private bootT = 0
  private flick = 0
  private webStep = 0
  private webT = 0
  private pattern = 0
  private wipe = 0
  private frame = 0
  private demoLines: { who: string; text: string; shown: number }[] = []
  private demoQueue: { who: string; text: string }[] = []
  private demoT = 0
  private time = 0

  constructor() {
    this.cv = document.createElement('canvas')
    this.cv.width = W
    this.cv.height = H
    this.ctx = this.cv.getContext('2d')!
    // prerendered scanline + pixel grid (1 draw call per frame)
    this.grid = document.createElement('canvas')
    this.grid.width = W
    this.grid.height = H
    const g = this.grid.getContext('2d')!
    g.fillStyle = 'rgba(0,0,0,0.25)'
    for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1.4)
    g.fillStyle = 'rgba(0,0,0,0.12)'
    for (let x = 0; x < W; x += 3) g.fillRect(x, 0, 1, H)
    // noise sprite
    this.noise = document.createElement('canvas')
    this.noise.width = 128
    this.noise.height = 128
    this.tex = new THREE.CanvasTexture(this.cv)
    this.tex.colorSpace = THREE.SRGBColorSpace
    this.tex.anisotropy = 4
  }

  setMode(m: ScreenMode) {
    if (m === this.mode) return
    this.mode = m
    this.wipe = 1
    if (m === 'boot') this.bootT = 0
    if (m === 'web') {
      this.webStep = 0
      this.webT = 0
    }
    this.pulse()
  }
  setPattern(i: number) {
    this.pattern = i
    this.pulse()
  }
  pulse() {
    this.glow = Math.min(1, this.glow + 0.7)
  }

  ask(q: string) {
    this.setMode('demo')
    const ans = DEMO_ANSWERS.find(([re]) => re.test(q))?.[1] ?? 'Context found.'
    this.demoQueue.push({ who: 'YOU', text: q })
    this.demoQueue.push({ who: 'XEVEN', text: ans })
    this.pulse()
  }

  tick(dt: number) {
    this.time += dt
    this.frame++
    this.glow = Math.max(0, this.glow - dt * 1.4)
    this.wipe = Math.max(0, this.wipe - dt * 2.4)
    this.flick = Math.random() < 0.06 ? Math.random() * 0.25 : this.flick * 0.9
    if (this.mode === 'boot') this.bootT += dt
    if (this.mode === 'web') {
      this.webT += dt
      if (this.webT > 1.6) {
        this.webT = 0
        this.webStep = Math.min(3, this.webStep + 1)
        this.pulse()
      }
    }
    if (this.demoQueue.length > 0 || this.demoLines.some((l) => l.shown < l.text.length)) {
      this.demoT += dt
      if (this.demoQueue.length > 0 && this.demoLines.every((l) => l.shown >= l.text.length)) {
        const q = this.demoQueue.shift()!
        this.demoLines.push({ ...q, shown: 0 })
        if (this.demoLines.length > 5) this.demoLines.shift()
      }
      if (this.demoT > 0.018) {
        this.demoT = 0
        const cur = this.demoLines[this.demoLines.length - 1]
        if (cur && cur.shown < cur.text.length) cur.shown += 2
      }
    }
    this.draw()
    this.tex.needsUpdate = true
  }

  private head(title: string) {
    const d = this.ctx
    d.fillStyle = '#04060d'
    d.fillRect(0, 0, W, H)
    d.fillStyle = '#0a1020'
    d.fillRect(0, 0, W, 40)
    d.fillStyle = '#8fa0c8'
    d.font = '17px ui-monospace, monospace'
    d.fillText(title, 16, 26)
    d.fillStyle = '#3a4666'
    d.fillText('9:41', W - 62, 26)
  }

  private mono(lines: string[], x: number, y: number, color = '#c6d2ef', gap = 30) {
    const d = this.ctx
    d.font = '20px ui-monospace, monospace'
    d.fillStyle = color
    lines.forEach((l, i) => d.fillText(l, x, y + i * gap))
  }

  private crt() {
    const d = this.ctx
    d.drawImage(this.grid, 0, 0)
    // sparse noise redraw
    if (this.frame % 4 === 0) {
      const n = this.noise.getContext('2d')!
      const img = n.createImageData(128, 128)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 14
      }
      n.putImageData(img, 0, 0)
    }
    d.globalAlpha = 0.5
    d.drawImage(this.noise, 0, 0, W, H)
    d.globalAlpha = 1
    // faint offset ghost ≈ chromatic separation
    d.globalAlpha = 0.07
    d.drawImage(this.cv, -1.5, 0)
    d.drawImage(this.cv, 1.5, 0)
    d.globalAlpha = 1
    // curvature + glow + flicker
    const g = d.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 430)
    g.addColorStop(0, `rgba(90,140,255,${0.04 + this.glow * 0.12})`)
    g.addColorStop(0.75, 'rgba(0,0,0,0.18)')
    g.addColorStop(1, 'rgba(0,0,0,0.5)')
    d.fillStyle = g
    d.fillRect(0, 0, W, H)
    if (this.flick > 0.02) {
      d.fillStyle = `rgba(160,200,255,${this.flick * 0.1})`
      d.fillRect(0, 0, W, H)
    }
    // mode-change wipe with bright edge
    if (this.wipe > 0) {
      const x = W * (1 - (1 - this.wipe) * (1 - this.wipe))
      d.fillStyle = '#02040a'
      d.fillRect(x, 0, W - x, H)
      d.fillStyle = 'rgba(127,216,255,0.8)'
      d.fillRect(x - 2, 0, 2, H)
    }
  }

  private draw() {
    const d = this.ctx
    const t = this.bootT
    switch (this.mode) {
      case 'boot': {
        this.head('XEVEN // BIOS')
        const lines = [
          t > 0.4 && 'XEVEN // SYSTEM BOOT',
          t > 1.2 && 'INITIALIZING...',
          t > 2.2 && 'CONTEXT ENGINE .... ONLINE',
          t > 3.0 && 'MEMORY ............ ONLINE',
          t > 3.8 && 'PERSONALIZATION ... ONLINE',
          t > 4.6 && 'XEVEN',
        ].filter(Boolean) as string[]
        this.mono(lines, 30, 130, '#c6d2ef', 42)
        if (t > 5.2) {
          d.fillStyle = '#e8efff'
          d.font = 'bold 24px ui-monospace, monospace'
          d.fillText('▮', 30, 130 + lines.length * 42)
        }
        break
      }
      case 'terminal': {
        this.head('XEVEN // CONTEXT')
        this.mono(['> USER DETECTED', '> CONTEXT FOUND', '> PROCESSING ...', '', 'activity .... ▓▓▓░', 'prefs ....... ▓▓▓▓', 'history ..... ▓▓░░'], 30, 120, '#9fe8ff', 40)
        break
      }
      case 'memory': {
        this.head('XEVEN // MEMORY')
        this.mono(['USER PROFILE', '', 'SIZE        42', 'BUDGET      ₹80K', 'INTEREST    GAMING', 'LAST VISIT  02:41'], 30, 120, '#ffd9a0', 42)
        d.fillStyle = '#ffb84d'
        d.fillRect(30, 120 + 6 * 42 + 8, 200 + Math.sin(this.time * 3) * 20, 3)
        break
      }
      case 'web': {
        this.head('— store —')
        const steps = [
          'Welcome to our store.',
          'Welcome back.',
          'Your size 42 is back in stock.',
          'Still looking for gaming gear around ₹80K?',
        ]
        d.font = 'bold 30px system-ui, sans-serif'
        const parts = steps[this.webStep].split(/(around ₹80K\?|back in stock\.?|back\.)/)
        parts.forEach((l, i) => {
          d.fillStyle = /around|back/.test(l) ? '#7fd8ff' : '#e8efff'
          d.fillText(l.slice(0, Math.floor(this.webT * 40)), 30, 190 + i * 38)
        })
        d.fillStyle = '#3a4666'
        d.font = '18px system-ui, sans-serif'
        d.fillText('personalized · grounded', 30, H - 40)
        break
      }
      case 'pattern': {
        const names = ['SUPPORT', 'SALES', 'SHOPPING', 'ADVISOR', 'LEADS', 'GENERAL']
        const descs = ['conversation interface', 'intent signals → close', 'recommendations ×3', 'spec compare A/B', 'structured capture', 'open assistant']
        this.head(`XEVEN // ${names[this.pattern % 6]}`)
        d.fillStyle = '#e8efff'
        d.font = 'bold 44px system-ui, sans-serif'
        d.fillText(names[this.pattern % 6], 30, 165)
        d.fillStyle = '#8fa0c8'
        d.font = '22px system-ui, sans-serif'
        d.fillText(descs[this.pattern % 6], 30, 210)
        d.strokeStyle = 'rgba(127,216,255,0.5)'
        d.lineWidth = 2
        for (let i = 0; i < 3; i++) {
          const y = 295 + i * 80
          const w = 200 + ((this.pattern * 67 + i * 53) % 180)
          d.strokeRect(30, y, w, 52)
        }
        const bx = 30 + ((this.time * 60) % 300)
        d.fillStyle = '#7fd8ff'
        d.fillRect(bx, 275, 3, 220)
        break
      }
      case 'layers': {
        this.head('XEVEN // ARCHITECTURE')
        this.mono(['SHELL', 'SCREEN', 'PCB', 'AI CORE', 'MEMORY', 'CONTEXT', 'DATA'], 30, 125, '#c6d2ef', 52)
        d.fillStyle = '#7fd8ff'
        const yi = 125 + (Math.floor(this.time * 1.2) % 7) * 52 - 18
        d.fillRect(18, yi, 6, 26)
        break
      }
      case 'final': {
        this.head('XEVEN')
        d.fillStyle = '#e8efff'
        d.font = 'bold 40px system-ui, sans-serif'
        d.fillText('THE WEB', 30, 215)
        d.fillText('SHOULD', 30, 265)
        d.fillText('REMEMBER.', 30, 315)
        break
      }
      case 'demo': {
        this.head('XEVEN // LIVE DEMO')
        let y = 105
        for (const l of this.demoLines.slice(-4)) {
          d.fillStyle = l.who === 'YOU' ? '#3a4666' : '#7fd8ff'
          d.font = '15px ui-monospace, monospace'
          d.fillText(l.who, 30, y)
          d.fillStyle = '#e8efff'
          d.font = '21px system-ui, sans-serif'
          const txt = l.text.slice(0, l.shown)
          d.fillText(txt.slice(0, 34), 30, y + 28)
          if (txt.length > 34) d.fillText(txt.slice(34, 68), 30, y + 54)
          y += 108
        }
        if (this.demoLines.length === 0) {
          d.fillStyle = '#8fa0c8'
          d.font = '20px system-ui, sans-serif'
          d.fillText('Ask below — I remember you.', 30, 200)
        }
        break
      }
    }
    this.crt()
  }
}
