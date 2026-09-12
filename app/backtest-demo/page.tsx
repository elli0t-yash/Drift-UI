"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Disclaimer } from "@/components/Disclaimer"
import { ErrorAlert } from "@/components/ErrorAlert"
import { Spinner } from "@/components/Spinner"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface SeriesMetric { sharpe: number; psr: number; dsr: number; max_dd: number }
interface BacktestSeriesResponse {
  dates: string[]
  series: { drift: number[]; equal_weight: number[]; nifty_price: number[] }
  metrics: { drift: SeriesMetric; equal_weight: SeriesMetric }
  metadata: { start_date: string; end_date: string; universe_size_range: [number, number]; known_limitations: string[] }
}

const LINE_COLORS = { drift: "var(--teal)", equal_weight: "var(--indigo)", nifty_price: "var(--amber)" } as const
const LINE_LABELS = { drift: "Drift", equal_weight: "Equal-weight", nifty_price: "Nifty 50" } as const
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 5, padding: "10px 16px", background: "var(--teal)", color: "var(--surface)", fontFamily: "var(--mono)", fontWeight: 700, cursor: "pointer" }
const panelStyle: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 22 }
const labelStyle: React.CSSProperties = { fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 11px", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 5, fontFamily: "var(--mono)", fontSize: 13 }

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
const pct = (value: number) => `${(value * 100).toFixed(1)}%`

function computeNav(returns: number[], principal: number): number[] {
  // Backend returns daily returns as decimal fractions (0.0066 == 0.66%),
  // confirmed against cache/backtest_series.json — not percentage points.
  let nav = principal
  return returns.map(r => (nav *= 1 + r))
}

function sharpeRatio(returns: number[]): number {
  if (returns.length < 2) return 0
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1)
  const std = Math.sqrt(variance)
  if (std === 0) return 0
  return (mean / std) * Math.sqrt(252)
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError"))
    return "Can't reach the analysis server right now. Please check back shortly."
  if (msg.includes("502") || msg.includes("503"))
    return "The analysis server is warming up. Wait a few seconds and try again."
  return "Something went wrong loading the backtest data. Please try again."
}

export default function BacktestDemoPage() {
  const [data, setData] = useState<BacktestSeriesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [principal, setPrincipal] = useState(1_000_000)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/dashboard/backtest/series`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: BacktestSeriesResponse = await res.json()
      if (!json.dates?.length) throw new Error("empty")
      setData(json)
      setStartDate(json.metadata.start_date)
      setEndDate(json.metadata.end_date)
    } catch (err) {
      setError(err instanceof Error && err.message === "empty"
        ? "No backtest data is available yet."
        : friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const range = useMemo(() => {
    if (!data) return null
    const startIdx = data.dates.findIndex(d => d >= startDate)
    let endIdx = data.dates.length - 1
    for (let i = data.dates.length - 1; i >= 0; i -= 1) { if (data.dates[i] <= endDate) { endIdx = i; break } }
    if (startIdx < 0 || endIdx < startIdx) return null
    return { startIdx, endIdx }
  }, [data, startDate, endDate])

  const chartData = useMemo(() => {
    if (!data || !range) return []
    const { startIdx, endIdx } = range
    const dates = data.dates.slice(startIdx, endIdx + 1)
    const driftNav = computeNav(data.series.drift.slice(startIdx, endIdx + 1), principal)
    const ewNav = computeNav(data.series.equal_weight.slice(startIdx, endIdx + 1), principal)
    const niftyNav = computeNav(data.series.nifty_price.slice(startIdx, endIdx + 1), principal)
    return dates.map((date, i) => ({ date, drift: driftNav[i], equal_weight: ewNav[i], nifty_price: niftyNav[i] }))
  }, [data, range, principal])

  const summary = useMemo(() => {
    if (!data || !range || !chartData.length) return null
    const { startIdx, endIdx } = range
    const slice = (key: keyof BacktestSeriesResponse["series"]) => data.series[key].slice(startIdx, endIdx + 1)
    const last = chartData[chartData.length - 1]
    return {
      drift: { nav: last.drift, totalReturn: last.drift / principal - 1, sharpe: sharpeRatio(slice("drift")) },
      equal_weight: { nav: last.equal_weight, totalReturn: last.equal_weight / principal - 1, sharpe: sharpeRatio(slice("equal_weight")) },
      nifty_price: { nav: last.nifty_price, totalReturn: last.nifty_price / principal - 1 },
    }
  }, [data, range, chartData, principal])

  return (
    <main style={{ minHeight: "100vh", maxWidth: 1120, margin: "0 auto", padding: "28px 24px 60px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <Link href="/" style={{ color: "var(--teal)", fontFamily: "var(--mono)", textDecoration: "none", fontWeight: 700 }}>📡 drift</Link>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>Backtest demo</span>
      </header>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Live backtest, walk-forward
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, maxWidth: 640 }}>
          Explore how Drift&apos;s signal-weighted portfolio has performed against an equal-weight baseline
          and the Nifty 50, on real historical data. Adjust the principal and date range below — all
          recalculation happens instantly in your browser.
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {loading && !data && (
        <div style={{ ...panelStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 280 }}>
          <Spinner /><span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>Loading backtest data…</span>
        </div>
      )}

      {!loading && error && !data && (
        <div style={{ ...panelStyle, textAlign: "center", padding: 50 }}>
          <p style={{ color: "var(--muted)", marginBottom: 18 }}>We couldn&apos;t load the demo right now.</p>
          <button onClick={load} style={buttonStyle}>Retry</button>
        </div>
      )}

      {data && (
        <>
          <section style={{ ...panelStyle, display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle} htmlFor="principal">Principal (₹)</label>
              <input
                id="principal"
                type="number"
                min={1000}
                step={1000}
                value={principal}
                onChange={e => setPrincipal(Math.max(0, Number(e.target.value) || 0))}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label style={labelStyle} htmlFor="start-date">Start date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                min={data.metadata.start_date}
                max={endDate || data.metadata.end_date}
                onChange={e => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label style={labelStyle} htmlFor="end-date">End date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                min={startDate || data.metadata.start_date}
                max={data.metadata.end_date}
                onChange={e => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </section>

          {!range || !chartData.length ? (
            <section style={{ ...panelStyle, textAlign: "center", padding: 40, marginBottom: 18 }}>
              <p style={{ color: "var(--muted)" }}>No trading days fall inside the selected date range.</p>
            </section>
          ) : (
            <>
              <section style={{ ...panelStyle, marginBottom: 18 }}>
                <div style={{ height: 380 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="var(--border)" />
                      <XAxis dataKey="date" minTickGap={40} tick={{ fill: "var(--muted)", fontSize: 10 }} />
                      <YAxis
                        tick={{ fill: "var(--muted)", fontSize: 10 }}
                        tickFormatter={value => inr.format(Number(value))}
                        width={90}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [inr.format(value), LINE_LABELS[name as keyof typeof LINE_LABELS] ?? name]}
                      />
                      <Legend formatter={(value: string) => LINE_LABELS[value as keyof typeof LINE_LABELS] ?? value} />
                      {(Object.keys(LINE_COLORS) as (keyof typeof LINE_COLORS)[]).map(key => (
                        <Line key={key} type="monotone" dataKey={key} stroke={LINE_COLORS[key]} dot={false} strokeWidth={2} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {summary && (
                <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 18 }}>
                  <StrategyCard title="Drift" color="var(--teal)" nav={summary.drift.nav} totalReturn={summary.drift.totalReturn}
                    sharpe={summary.drift.sharpe} psr={data.metrics.drift.psr} dsr={data.metrics.drift.dsr} maxDd={data.metrics.drift.max_dd} />
                  <StrategyCard title="Equal-weight" color="var(--indigo)" nav={summary.equal_weight.nav} totalReturn={summary.equal_weight.totalReturn}
                    sharpe={summary.equal_weight.sharpe} psr={data.metrics.equal_weight.psr} dsr={data.metrics.equal_weight.dsr} maxDd={data.metrics.equal_weight.max_dd} />
                  <StrategyCard title="Nifty 50" color="var(--amber)" nav={summary.nifty_price.nav} totalReturn={summary.nifty_price.totalReturn} />
                </section>
              )}
            </>
          )}

          <details style={{ ...panelStyle, marginBottom: 18 }}>
            <summary style={{ cursor: "pointer", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
              Methodology notes
            </summary>
            <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 10 }}>
                Data covers <strong style={{ color: "var(--text)" }}>{data.metadata.start_date}</strong> to{" "}
                <strong style={{ color: "var(--text)" }}>{data.metadata.end_date}</strong>, across a universe of{" "}
                {data.metadata.universe_size_range[0]}–{data.metadata.universe_size_range[1]} names. Sharpe above reflects your selected date range,
                recomputed live; PSR, DSR, and max drawdown reflect the full backtest period.
              </p>
              {data.metadata.known_limitations?.length > 0 && (
                <ul style={{ paddingLeft: 18 }}>
                  {data.metadata.known_limitations.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
                </ul>
              )}
            </div>
          </details>

          <Disclaimer variant="full" />
        </>
      )}
    </main>
  )
}

function StrategyCard({ title, color, nav, totalReturn, sharpe, psr, dsr, maxDd }: {
  title: string; color: string; nav: number; totalReturn: number
  sharpe?: number; psr?: number; dsr?: number; maxDd?: number
}) {
  const showQuant = sharpe !== undefined
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
        <strong style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)" }}>{title}</strong>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Stat label="Final NAV" value={inr.format(nav)} />
        <Stat label="Total return" value={pct(totalReturn)} positive={totalReturn >= 0} />
        {showQuant && (
          <>
            <Stat label="Sharpe (range)" value={sharpe!.toFixed(2)} />
            <Stat label="PSR" value={pct(psr!)} />
            <Stat label="DSR" value={pct(dsr!)} />
            <Stat label="Max drawdown" value={pct(maxDd!)} />
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const color = positive === undefined ? "var(--text)" : positive ? "var(--teal)" : "var(--red)"
  return (
    <div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}
