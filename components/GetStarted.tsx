'use client'

import { useState } from 'react'

const TABS = ['Python', 'REST API', 'Codex CLI'] as const
type Tab = typeof TABS[number]

const PYTHON_CODE = `from drift.data import DataLoader
from drift.features.factors import FactorEngine
from drift.portfolio.hrp import HRP
from drift.backtest.engine import BacktestEngine

# one pipeline, seven layers
loader  = DataLoader()
ohlcv   = loader.equity_ohlcv(["AAPL", "MSFT", "NVDA"])
result  = BacktestEngine(HRP()).run(ohlcv)
print(result)  # Sharpe=0.70 · PSR=0.89 · MaxDD=−0.16`

const API_CODE = `# 1. start the server
uvicorn drift.api.main:app --port 8000

# 2. compute factor signals
curl -X POST http://localhost:8000/signals/compute \\
  -H "Content-Type: application/json" \\
  -d '{"tickers":["AAPL","MSFT","NVDA"],
       "start_date":"2023-01-01","benchmark":"SPY"}'

# 3. optimise portfolio
curl -X POST http://localhost:8000/portfolio/optimise \\
  -d '{"tickers":["AAPL","MSFT","NVDA"],
       "start_date":"2022-01-01","method":"hrp"}'

# 4. run backtest (async job)
curl -X POST http://localhost:8000/backtest/run \\
  -d '{"tickers":["AAPL","MSFT"],"start_date":"2021-01-01"}'
# → {"job_id":"abc-123","status":"queued"}

curl http://localhost:8000/backtest/abc-123
# → {"status":"done","result":{...}}`

const MCP_CODE = `# ~/.codex/config.yaml
mcpServers:
  drift:
    command: python
    args:
      - /path/to/drift/drift/api/mcp_server.py

# then ask Codex naturally:
codex "compute signals for AAPL, MSFT, NVDA and tell me \\
       which has the strongest momentum signal"

codex "optimise a portfolio of RELIANCE.NS, TCS.NS, \\
       HDFCBANK.NS using HRP and explain the weights"

codex "run a 3-year backtest on the Mag 7 with 5bps \\
       commission and show me the PSR"`

const CODE: Record<Tab, string> = {
  Python: PYTHON_CODE,
  'REST API': API_CODE,
  'Codex CLI': MCP_CODE,
}

export function GetStarted() {
  const [tab, setTab] = useState<Tab>('Python')
  const [copied, setCopied] = useState(false)

  const tabStyle = (item: Tab): React.CSSProperties => ({
    fontFamily: 'var(--mono)',
    fontSize: 12,
    padding: '6px 16px',
    borderRadius: '4px 4px 0 0',
    border: `1px solid ${item === tab ? 'var(--teal)' : 'var(--border)'}`,
    borderBottom: item === tab ? '1px solid var(--surface)' : '1px solid var(--border)',
    background: item === tab ? 'var(--surface)' : 'transparent',
    color: item === tab ? 'var(--teal)' : 'var(--muted)',
    cursor: 'pointer',
    marginBottom: -1,
  })

  return (
    <section id="started" className="section">
      <div className="sec-label">get started</div>
      <h2 className="sec-h2">Running in three minutes</h2>

      <div style={{ display: 'flex', gap: 4, paddingLeft: 2 }}>
        {TABS.map(item => (
          <button key={item} style={tabStyle(item)} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="code-wrap" style={{ borderTopLeftRadius: 0 }}>
        <div className="code-hdr">
          <span className="code-ttl">{tab.toLowerCase()} — quick start</span>
          <button
            className="copy-btn"
            onClick={() => {
              navigator.clipboard?.writeText(CODE[tab])
              setCopied(true)
              setTimeout(() => setCopied(false), 1400)
            }}
          >
            {copied ? '✓' : 'copy'}
          </button>
        </div>
        <pre className="code-body">{CODE[tab]}</pre>
      </div>
      {tab === 'Codex CLI' && (
        <p style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
          Works with Claude Desktop and OpenAI Codex CLI.
        </p>
      )}
    </section>
  )
}
