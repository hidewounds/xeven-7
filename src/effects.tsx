/* NOTE: Cursor lives in chrome.tsx (single owner — avoids duplicate bindings).
   This module owns the Ticker. */

/* Basement-style mega ticker (MagicUI marquee mechanics, CSS only) */
export function Ticker({ items }: { items: string[] }) {
  const row = `${items.join(' \u25c6 ')} \u25c6 `
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-inner">
        <span>{row}</span>
        <span>{row}</span>
      </div>
    </div>
  )
}
