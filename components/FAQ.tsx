'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Does Drift work with Indian equities (NSE/BSE)?',
    a: 'Yes. Append .NS for NSE (e.g. RELIANCE.NS, TCS.NS) or .BO for BSE. The yfinance provider handles both. Use ^NSEI as the benchmark for Nifty-based regime detection.',
  },
  {
    q: 'Which data vendors are supported?',
    a: 'Any OpenBB-compatible provider: yfinance (free, default), Polygon.io, Refinitiv, Bloomberg. The DataLoader is provider-agnostic — swap the provider string in one line without changing any other code.',
  },
  {
    q: 'How does Drift scale to large universes (500+ tickers)?',
    a: 'The Parquet cache handles repeated fetches. The factor engine is vectorised with NumPy. For very large universes (>200 tickers) the CVaR optimiser is the bottleneck — use HRP instead, which scales linearly. A Dask/Ray parallel backend is on the roadmap.',
  },
  {
    q: 'Can I use this for live trading?',
    a: 'Drift is a research and signal generation platform, not an execution layer. It generates factor signals and portfolio weights. Wire the FastAPI /portfolio/optimise endpoint to your broker (Zerodha Kite, Interactive Brokers, Alpaca) for live execution.',
  },
  {
    q: 'Is the backtest forward-looking (lookahead bias)?',
    a: 'No. The engine uses an expanding window — only data available at each rebalance date is used. Factor signals use point-in-time prices. Fundamentals are forward-filled from the last reported quarter, not restated. The StandardScaler in the HMM is fitted on training data only and reused at inference.',
  },
  {
    q: 'What is the MCP server for?',
    a: 'The Model Context Protocol server exposes Drift as a tool for LLM agents. Connect it to Claude Desktop or OpenAI Codex CLI and query your portfolio signals in natural language: "which factor has the highest ICIR this month" or "optimise a Nifty 10 portfolio using HRP".',
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
