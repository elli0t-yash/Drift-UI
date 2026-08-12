'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Does Drift work with Indian equities (NSE/BSE)?',
    a: 'Yes. Drift is India-first: it is built around Zerodha Kite data (OHLCV + fundamentals for the Nifty 50, Bank Nifty, and custom NSE universes). An automated daily token-refresh robot handles the Zerodha session renewal so the engine runs unattended from market open.',
  },
  {
    q: 'Which data vendors are supported?',
    a: 'Zerodha Kite is the primary data source for Indian equities. Data is fetched by a fully asynchronous, non-blocking engine paced exactly at the broker\'s rate limit. All screener math is precomputed at dawn and served from memory-mapped Arrow files in <150 ms — no per-request network calls during the trading day.',
  },
  {
    q: 'How does Drift scale to large universes (500+ tickers)?',
    a: 'The factor engine uses vectorized matrix operations — the rank transform and wavelet scattering run as single batched tensor ops, not per-ticker loops. Standard universes (Nifty 50, Bank Nifty) are precomputed in a memory-mapped FeatureStore and served in <150 ms. For very large custom universes, the async pipeline falls back to a non-blocking live computation that cannot block other users.',
  },
  {
    q: 'Can I use this for live trading?',
    a: 'Drift ends at target weights. It is a research and decision engine, not an order-execution system — users place trades at their own broker. This is by design: Drift has no conflict of interest in your execution, and no broker licensing is required. The output is a complete, mathematically defensible research report including factor scores, regime context, risk decomposition, and portfolio weights.',
  },
  {
    q: 'Is the backtest forward-looking (lookahead bias)?',
    a: 'No. The engine uses an expanding walk-forward window — only data available at each rebalance date is used. Critically, regime probabilities are forward-filtered (point-in-time), not smoothed. The legacy HMM used smoothed probabilities where every historical date "knew" the future; Drift 2.0 enforces a forward-only recursion, verified by a property test in CI that appending future data must not change any earlier probability.',
  },
  {
    q: 'What is the MCP server for?',
    a: 'The Model Context Protocol server exposes Drift as a tool for LLM agents. Connect it to Claude Desktop or OpenAI Codex CLI and query your portfolio signals in natural language: "which factor has the highest ICIR this month" or "optimise a Nifty 50 portfolio using Black-Litterman".',
  },
  {
    q: 'What changed in Drift 2.0?',
    a: 'Seven major upgrades: (1) automated daily broker-token refresh with TOTP — zero human mornings; (2) fully async data engine, concurrent and rate-limit-aware; (3) memory-mapped precomputed FeatureStore, <150 ms screener responses; (4) vectorized math core — rank transform and wavelet scattering as batched matrix/tensor ops; (5) co-movement graph regimes — detects sector correlation tightening before the index confirms stress; (6) endogenous, self-calibrating Black-Litterman confidence — the allocator reduces its own risk when recent predictions have been wrong; (7) enforced quality guardrails — strict data contracts, zero-lookahead CI checks, and graceful fallbacks.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="section">
      <div className="sec-label">common questions</div>
      <h2 className="sec-h2">FAQ</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {FAQS.map((faq, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${open === i ? 'var(--teal)' : 'var(--border)'}`,
              borderRadius: 6,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: 16 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                {faq.q}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: open === i ? 'var(--teal)' : 'var(--muted)', flexShrink: 0, transition: 'transform 0.2s, color 0.15s', transform: open === i ? 'rotate(45deg)' : 'none' }}>
                +
              </span>
            </div>
            {open === i && (
              <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
