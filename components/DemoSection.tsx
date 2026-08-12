'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from 'recharts'
import { useTheme } from 'next-themes'

/* ── Synthetic data helpers ─────────────────────────────── */

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

function generateEquityCurve() {
  const rng = seededRng(42)
  // 756 trading days ≈ 3 years
  const phases = [
    { days: 60,  mu:  0.0008, sigma: 0.010 }, // early bull
    { days: 180, mu: -0.0006, sigma: 0.018 }, // 2022 drawdown
    { days: 60,  mu:  0.0002, sigma: 0.014 }, // sideways
    { days: 200, mu:  0.0012, sigma: 0.011 }, // 2023 recovery
    { days: 256, mu:  0.0010, sigma: 0.009 }, // 2024 bull
  ]

  const dates: string[] = []
  const drift: number[] = []
  const bench: number[] = []

  let d = 1.0, b = 1.0
  let dateMs = new Date('2022-01-03').getTime()
  const DAY = 86400000

  for (const { days, mu, sigma } of phases) {
    for (let i = 0; i < days; i++) {
      const r  = mu + sigma * (rng() * 2 - 1) * 1.4
      const rb = (mu * 0.85) + sigma * 0.95 * (rng() * 2 - 1) * 1.4
      d *= 1 + r
      b *= 1 + rb
      const dt = new Date(dateMs)
      if (dt.getDay() !== 0 && dt.getDay() !== 6) {
        dates.push(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`)
        drift.push(parseFloat(((d - 1) * 100).toFixed(2)))
        bench.push(parseFloat(((b - 1) * 100).toFixed(2)))
      }
      dateMs += DAY
    }
  }

  // Downsample to monthly for cleaner chart
  const monthly: { date: string; drift: number; bench: number }[] = []
  let prev = ''
  dates.forEach((d, i) => {
    if (d !== prev) { monthly.push({ date: d, drift: drift[i], bench: bench[i] }); prev = d }
  })
  return monthly
}

function generateIcHeatmap() {
  const rng = seededRng(7)
  const factors = ['momentum', 'value', 'size', 'quality', 'profitability', 'investment', 'beta']
  const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
                   'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return factors.map(f => ({
    factor: f,
    values: months.map(() => parseFloat(((rng() - 0.45) * 0.3).toFixed(3))),
  }))
}

function generateSignals() {
  const rng = seededRng(99)
  const tickers = ['AAPL','MSFT','NVDA','GOOGL','META','JPM','GS','RELIANCE.NS','TCS.NS','INFY.NS']
  const factors  = ['momentum','value','quality','size']
  return tickers.map(t => ({
    ticker:    t,
    composite: parseFloat(((rng() - 0.5) * 2).toFixed(3)),
    scores:    Object.fromEntries(factors.map(f => [f, parseFloat(((rng() - 0.5) * 2).toFixed(3))])),
    regime:    ['bull','bull','bear','sideways','bull'][Math.floor(rng()*5)],
  }))
}

/* ── Sub-components ─────────────────────────────────────── */

function EquityChart({ isDark }: { isDark: boolean }) {
  const data = useMemo(generateEquityCurve, [])
  const tc = isDark ? '#00C896' : '#00967A'
  const bc = isDark ? '#818CF8' : '#4338CA'
  const gr = isDark ? 'rgba(0,200,150,0.12)' : 'rgba(0,150,122,0.10)'
  const tx = isDark ? '#94A3B8' : '#6B7280'
  const ax = isDark ? '#1E2D40' : '#E5E7EB'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: isDark ? '#0D1421' : '#fff', border: `1px solid ${ax}`, borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 11 }}>
        <div style={{ color: tx, marginBottom: 6 }}>{label}</div>
        <div style={{ color: tc }}>Drift  {payload[0]?.value > 0 ? '+' : ''}{payload[0]?.value}%</div>
        <div style={{ color: bc }}>SPY   {payload[1]?.value > 0 ? '+' : ''}{payload[1]?.value}%</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 12, display: 'flex', gap: 20 }}>
        <span style={{ color: tc }}>● Drift HRP</span>
        <span style={{ color: bc }}>● S&amp;P 500</span>
        <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>2022 – 2024 · synthetic backtest</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={tc} stopOpacity={0.25} />
              <stop offset="95%" stopColor={tc} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={ax} strokeDasharray="3 3" strokeOpacity={0.5} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: tx, fontFamily: 'var(--mono)' }} tickLine={false} interval={5} />
          <YAxis tick={{ fontSize: 10, fill: tx, fontFamily: 'var(--mono)' }} tickLine={false} tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`} width={52} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="drift" stroke={tc} strokeWidth={2} fill="url(#driftGrad)" dot={false} />
          <Line type="monotone" dataKey="bench" stroke={bc} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function IcHeatmap({ isDark }: { isDark: boolean }) {
  const data = useMemo(generateIcHeatmap, [])
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D','J','F','M','A','M','J','J','A','S','O','N','D']

  const color = (v: number) => {
    const t = Math.max(-1, Math.min(1, v / 0.15))
    if (isDark) {
      if (t > 0) return `rgba(0,200,150,${t * 0.9})`
      return `rgba(239,68,68,${-t * 0.9})`
    }
    if (t > 0) return `rgba(0,150,122,${t * 0.85})`
    return `rgba(220,38,38,${-t * 0.85})`
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
        IC by factor × month · green = predictive · red = anti-predictive
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 480 }}>
        <thead>
          <tr>
            <th style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', fontWeight: 400, textAlign: 'left', padding: '0 8px 6px 0', width: 90 }}>factor</th>
            {months.map((m, i) => (
              <th key={i} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', fontWeight: 400, padding: '0 1px 6px' }}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.factor}>
              <td style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text)', padding: '2px 8px 2px 0', whiteSpace: 'nowrap' }}>{row.factor}</td>
              {row.values.map((v, i) => (
                <td key={i} style={{ width: 18, height: 18, background: color(v), borderRadius: 2, cursor: 'default' }} title={`IC = ${v}`} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
        <span>IC scale:</span>
        <span>−0.15</span>
        {([-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15]).map((v, i) => (
          <div key={i} style={{ width: 22, height: 10, borderRadius: 2, background: color(v), border: v === 0 ? '1px solid var(--border)' : 'none' }} />
        ))}
        <span>+0.15</span>
        <span style={{ marginLeft: 8, color: 'var(--teal)' }}>positive IC</span>
        <span style={{ color: 'var(--red)' }}>negative IC</span>
      </div>
    </div>
  )
}

function SignalsTable({ isDark }: { isDark: boolean }) {
  const signals = useMemo(generateSignals, [])
  const tc = isDark ? '#00C896' : '#00967A'
  const rc = isDark ? '#EF4444' : '#DC2626'
  const regimeColor: Record<string, string> = {
    bull:      isDark ? 'rgba(0,200,150,0.15)' : 'rgba(0,150,122,0.12)',
    bear:      isDark ? 'rgba(239,68,68,0.12)'  : 'rgba(220,38,38,0.10)',
    sideways:  isDark ? 'rgba(245,158,11,0.12)' : 'rgba(180,83,9,0.10)',
  }
  const regimeText: Record<string, string> = {
    bull: isDark ? '#00C896' : '#00967A',
    bear: isDark ? '#EF4444' : '#DC2626',
    sideways: isDark ? '#F59E0B' : '#B45309',
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
        current factor signals · composite score and per-factor breakdown
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 500 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid var(--border)` }}>
            {['ticker','composite','momentum','value','quality','size','regime'].map(h => (
              <th key={h} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', fontWeight: 400, textAlign: h === 'ticker' ? 'left' : 'center', padding: '0 8px 8px', letterSpacing: '0.05em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {signals.map(s => (
            <tr key={s.ticker} style={{ borderBottom: `1px solid ${isDark ? '#111827' : '#F3F2EF'}` }}>
              <td style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--text)', padding: '7px 8px 7px 0' }}>{s.ticker}</td>
              <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: s.composite >= 0 ? tc : rc, padding: '7px 8px' }}>{s.composite > 0 ? '+' : ''}{s.composite.toFixed(2)}</td>
              {(['momentum','value','quality','size'] as const).map(f => (
                <td key={f} style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: s.scores[f] >= 0 ? tc : rc, padding: '7px 8px', opacity: 0.85 }}>
                  {s.scores[f] > 0 ? '+' : ''}{s.scores[f].toFixed(2)}
                </td>
              ))}
              <td style={{ textAlign: 'center', padding: '7px 8px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, background: regimeColor[s.regime], color: regimeText[s.regime], padding: '2px 8px', borderRadius: 3 }}>{s.regime}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ComparisonChart({ isDark }: { isDark: boolean }) {
  const data = useMemo(() => {
    const rng = seededRng(123)
    const phases = [
      { days: 9,  muD: 0.0008, muE: 0.0006, muB: 0.0005, sigma: 0.010 },
      { days: 17, muD:-0.0006, muE:-0.0005, muB:-0.0004, sigma: 0.018 },
      { days: 10, sigma: 0.011, muD: 0.0012, muE: 0.0009, muB: 0.0007 },
    ]
    let d = 1, e = 1, b = 1
    const rows: { month: string; drift: number; equal: number; bah: number }[] = []
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug',
                    'Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr',
                    'May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
                    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug',
                    'Sep','Oct','Nov','Dec']
    let mi = 0
    for (const ph of phases) {
      for (let i = 0; i < ph.days; i++) {
        d *= 1 + ph.muD + ph.sigma * (rng() * 2 - 1) * 1.2
        e *= 1 + ph.muE + ph.sigma * (rng() * 2 - 1) * 1.2
        b *= 1 + ph.muB + ph.sigma * (rng() * 2 - 1) * 1.2
        rows.push({
          month: months[mi++ % 36],
          drift: parseFloat(((d - 1) * 100).toFixed(2)),
          equal: parseFloat(((e - 1) * 100).toFixed(2)),
          bah: parseFloat(((b - 1) * 100).toFixed(2)),
        })
      }
    }
    return rows
  }, [])

  const tc = isDark ? '#00C896' : '#00967A'
  const ic = isDark ? '#818CF8' : '#4338CA'
  const mc = isDark ? '#64748B' : '#9CA3AF'
  const ax = isDark ? '#1E2D40' : '#E5E7EB'
  const tx = isDark ? '#94A3B8' : '#6B7280'

  const tooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: isDark ? '#0D1421' : '#fff', border: `1px solid ${ax}`, borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 11 }}>
        <div style={{ color: tx, marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.stroke }}>
            {p.name}  {p.value > 0 ? '+' : ''}{p.value}%
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    { label: 'Drift HRP', sharpe: '0.70', color: tc },
    { label: 'Equal weight', sharpe: '0.52', color: ic },
    { label: 'Buy-and-hold', sharpe: '0.41', color: mc },
  ]

  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 12, display: 'flex', gap: 20 }}>
        <span style={{ color: tc }}>● Drift HRP</span>
        <span style={{ color: ic }}>● Equal weight</span>
        <span style={{ color: mc }}>● Buy-and-hold</span>
        <span style={{ marginLeft: 'auto' }}>2022–2024 · same universe</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={ax} strokeDasharray="3 3" strokeOpacity={0.5} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: tx, fontFamily: 'var(--mono)' }} tickLine={false} interval={5} />
          <YAxis tick={{ fontSize: 10, fill: tx, fontFamily: 'var(--mono)' }} tickLine={false} tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`} width={52} />
          <Tooltip content={tooltip} />
          <Line type="monotone" dataKey="drift" name="Drift HRP" stroke={tc} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="equal" name="Equal weight" stroke={ic} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="bah" name="Buy-and-hold" stroke={mc} strokeWidth={1.5} dot={false} strokeDasharray="2 3" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 4 }}>
              {s.sharpe}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text)', marginBottom: 2 }}>Sharpe ratio</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Stats row ──────────────────────────────────────────── */

const STATS = [
  { label: 'Sharpe ratio',   value: '0.70',  sub: 'HRP 3-year backtest' },
  { label: 'PSR',            value: '88.6%', sub: 'vs SR* = 0.0' },
  { label: 'Max drawdown',   value: '−16.2%',sub: '2022 bear market', negative: true },
  { label: 'ICIR · momentum',value: '0.294', sub: 'out of sample' },
  { label: 'Factors tracked',value: '7',     sub: 'FF5 + mom + quality' },
  { label: 'Tests passing',  value: '182',   sub: '0 failures' },
]

/* ── Main export ────────────────────────────────────────── */

const TABS = ['Equity curve', 'IC heatmap', 'Live signals', 'Comparison'] as const
type Tab = typeof TABS[number]

export function DemoSection() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<Tab>('Equity curve')
  useEffect(() => setMounted(true), [])
  const isDark = mounted ? theme !== 'light' : true

  const tabStyle = (t: Tab) => ({
    fontFamily: 'var(--mono)',
    fontSize: 12,
    padding: '6px 16px',
    borderRadius: '4px 4px 0 0',
    border: `1px solid ${t === tab ? 'var(--teal)' : 'var(--border)'}`,
    borderBottom: t === tab ? `1px solid var(--surface)` : `1px solid var(--border)`,
    background: t === tab ? 'var(--surface)' : 'transparent',
    color: t === tab ? 'var(--teal)' : 'var(--muted)',
    cursor: 'pointer',
    marginBottom: -1,
    transition: 'all 0.15s',
  } as React.CSSProperties)

  return (
    <section className="section">
      <div className="sec-label">platform demo</div>
      <h2 className="sec-h2">See what Drift produces</h2>
      <p className="sec-sub">Synthetic three-year backtest on a 10-stock universe. Same pipeline as production.</p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 36 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: s.negative ? 'var(--red)' : 'var(--teal)', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text)', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tab chart */}
      <div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 0, paddingLeft: 2 }}>
          {TABS.map(t => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0 6px 6px 6px', padding: 24 }}>
          {tab === 'Equity curve'  && <EquityChart isDark={isDark} />}
          {tab === 'IC heatmap'    && <IcHeatmap   isDark={isDark} />}
          {tab === 'Live signals'  && <SignalsTable isDark={isDark} />}
          {tab === 'Comparison'    && <ComparisonChart isDark={isDark} />}
        </div>
      </div>
    </section>
  )
}
