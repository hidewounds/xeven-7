import { useRef, useState } from 'react'

/* Copilot demo — a live page-agent (MIT, alibaba/page-agent) driving THIS
   page in the visitor's own browser. Lazy-loaded on first enable so the
   dependency never touches first paint. Bring-your-own LLM key or a local
   Ollama endpoint; credentials persist in this browser only (localStorage)
   and are never proxied anywhere. Without a configured model the section
   honestly says so instead of faking a demo. */

const LS_KEY = 'xeven.copilot'

interface CopilotConfig {
  model: string
  baseURL: string
  apiKey: string
}

function loadConfig(): CopilotConfig {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<CopilotConfig>
      return {
        model: typeof p.model === 'string' && p.model ? p.model : 'qwen3.5-plus',
        baseURL: typeof p.baseURL === 'string' && p.baseURL ? p.baseURL : 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: typeof p.apiKey === 'string' ? p.apiKey : '',
      }
    }
  } catch {
    /* corrupted storage — fall through to defaults */
  }
  return { model: 'qwen3.5-plus', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: '' }
}

const SUGGESTIONS = [
  'Go to the pricing page',
  'Switch pricing to yearly billing',
  'Take me to the demo booking form',
  'Scroll back to the top',
]

type Phase = 'idle' | 'setup' | 'ready' | 'running'

export default function CopilotDemo() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [cfg, setCfg] = useState<CopilotConfig>(loadConfig)
  const [cmd, setCmd] = useState('')
  const [status, setStatus] = useState('')
  const agent = useRef<{ execute: (task: string) => Promise<unknown> } | null>(null)

  const save = (next: CopilotConfig) => {
    setCfg(next)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next))
    } catch {
      /* private mode — config just won't persist */
    }
  }

  const enable = async () => {
    if (!cfg.apiKey.trim() && !cfg.baseURL.includes('127.0.0.1') && !cfg.baseURL.includes('localhost')) {
      setPhase('setup')
      setStatus('Add an API key below — or point the endpoint at local Ollama. The key never leaves this browser.')
      return
    }
    setPhase('setup')
  }

  const connect = async () => {
    if (!cfg.model.trim() || !cfg.baseURL.trim()) {
      setStatus('Model and endpoint are both required.')
      return
    }
    setStatus('Loading the copilot…')
    try {
      const mod = await import('page-agent')
      agent.current = new mod.PageAgent({
        model: cfg.model.trim(),
        baseURL: cfg.baseURL.trim(),
        apiKey: cfg.apiKey.trim() || undefined,
        language: 'en-US',
      }) as unknown as { execute: (task: string) => Promise<unknown> }
      setPhase('ready')
      setStatus('Copilot ready. Give it a command — it acts on this page, in this browser.')
    } catch (e) {
      setPhase('setup')
      setStatus(`Could not start the copilot: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const run = async (task: string) => {
    const t = task.trim()
    if (!t || !agent.current) return
    setPhase('running')
    setStatus(`Working: ${t}`)
    try {
      const res = (await agent.current.execute(t)) as { success?: boolean; message?: string } | null
      const ok = res !== null && typeof res === 'object' && 'success' in res ? res.success !== false : true
      const extra = res !== null && typeof res === 'object' && typeof res.message === 'string' && res.message ? ` — ${res.message.slice(0, 220)}` : ''
      setStatus(ok ? `Done: ${t}${extra}` : `It stopped without finishing: ${t}${extra}`)
    } catch (e) {
      setStatus(`Command failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setPhase('ready')
    }
  }

  return (
    <div className="kb-demo" data-testid="copilot-demo">
      {phase === 'idle' && (
        <>
          <p className="kb-hit">One script gives this page its own AI operator. Enable it and command the page in plain words.</p>
          <div>
            <button className="pill" type="button" onClick={enable} data-cursor>
              Enable the copilot →
            </button>
          </div>
        </>
      )}
      {phase !== 'idle' && (
        <>
          <label>
            MODEL
            <input value={cfg.model} onChange={(e) => save({ ...cfg, model: e.target.value })} placeholder="qwen3.5-plus" autoComplete="off" aria-label="Model name" />
          </label>
          <label>
            ENDPOINT
            <input value={cfg.baseURL} onChange={(e) => save({ ...cfg, baseURL: e.target.value })} placeholder="https://…/v1 or http://127.0.0.1:11434/v1" autoComplete="off" spellCheck={false} aria-label="Model endpoint" />
          </label>
          <label>
            API KEY — STAYS IN THIS BROWSER
            <input
              value={cfg.apiKey}
              onChange={(e) => save({ ...cfg, apiKey: e.target.value })}
              placeholder="sk-… (empty for local Ollama)"
              type="password"
              autoComplete="off"
              aria-label="API key, stored only in this browser"
            />
          </label>
          <div>
            <button className="pill" type="button" onClick={connect} data-cursor>
              Connect →
            </button>
          </div>
        </>
      )}
      {phase === 'ready' || phase === 'running' ? (
        <>
          <div className="pills" role="group" aria-label="Suggested commands">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="pill pill-ghost" data-cursor disabled={phase === 'running'} onClick={() => run(s)}>
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void run(cmd)
              setCmd('')
            }}
          >
            <label>
              COMMAND THE PAGE
              <input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="Tell it what to do…" autoComplete="off" aria-label="Command for the copilot" disabled={phase === 'running'} />
            </label>
          </form>
        </>
      ) : null}
      {status && (
        <p className="kb-hit" role="status">
          {status}
        </p>
      )}
    </div>
  )
}
