"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ErrorAlert } from "@/components/ErrorAlert"
import { Spinner } from "@/components/Spinner"
import { api, BacktestResponse, OptimiseResponse, RiskResponse, SignalResponse, Tier } from "@/lib/api"
import { useApiKey } from "@/lib/useApiKey"

type Tab = "Signals" | "Portfolio" | "Risk" | "Backtest"
type Usage = { email: string; tier: Tier; requests_today: number; daily_limit: number; remaining: number; total_calls: number }
const TABS: Tab[] = ["Signals", "Portfolio", "Risk", "Backtest"]
const CHART_COLORS = ["var(--teal)", "var(--indigo)", "var(--amber)", "var(--red)", "var(--muted)"]
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 5, padding: "10px 16px", background: "var(--teal)", color: "var(--surface)", fontFamily: "var(--mono)", fontWeight: 700, cursor: "pointer" }
const panelStyle: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 22 }

const pct = (value: number) => `${(value * 100).toFixed(1)}%`
const score = (scores: Record<string, number>, key: string) => scores[key] ?? scores[key.toLowerCase()] ?? scores[key[0].toUpperCase() + key.slice(1)]

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes("expired") || msg.includes("403"))
    return "Market data connection expired. The server refreshes this daily at 9 AM IST. Try again shortly."
  if (msg.includes("429"))
    return "Daily request limit reached. Upgrade to Pro for 2,000 requests/day."
  if (msg.includes("401"))
    return "Invalid API key. Sign out and get a new key."
  if (msg.includes("502") || msg.includes("503"))
    return "The analysis server is warming up. Wait 10 seconds and try again."
  if (msg.includes("not found") || msg.includes("instrument"))
    return "One or more tickers not found on NSE. Use bare symbols like RELIANCE, TCS, INFY."
  return msg
}

export default function DashboardPage() {
  const router = useRouter()
  const { apiKey, clearApiKey, hasKey, isLoaded } = useApiKey()
  const [usage, setUsage] = useState<Usage | null>(null)
  const [tickersInput, setTickersInput] = useState("RELIANCE,TCS,INFY,HDFCBANK,ICICIBANK")
  const [tab, setTab] = useState<Tab>("Signals")
  const [signals, setSignals] = useState<SignalResponse | null>(null)
  const [portfolio, setPortfolio] = useState<OptimiseResponse | null>(null)
  const [risk, setRisk] = useState<RiskResponse | null>(null)
  const [backtest, setBacktest] = useState<BacktestResponse | null>(null)
  const [loading, setLoading] = useState<string>("")
  const [error, setError] = useState("")
  const tickers = useMemo(() => tickersInput.split(",").map(value => value.trim().toUpperCase()).filter(Boolean), [tickersInput])

  const refreshUsage = useCallback(async () => {
    setLoading("usage")
    setError("")
    try {
      setUsage(await api.me(apiKey))
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading("")
    }
  }, [apiKey])

  useEffect(() => {
    if (!isLoaded) return
    if (!hasKey) return router.replace("/signup")
    refreshUsage()
  }, [hasKey, isLoaded, refreshUsage, router])

  const run = async (kind: "signals" | "portfolio" | "risk" | "backtest") => {
    if (!tickers.length) return setError("Enter at least one ticker.")
    setLoading(kind)
    setError("")
    try {
      if (kind === "signals") setSignals(await api.signals(apiKey, tickers))
      if (kind === "portfolio") setPortfolio(await api.optimise(apiKey, tickers))
      if (kind === "risk") {
        const weight = 1 / tickers.length
        setRisk(await api.risk(apiKey, Object.fromEntries(tickers.map(ticker => [ticker, weight]))))
      }
      if (kind === "backtest" && usage?.tier === "pro") setBacktest(await api.backtest(apiKey, tickers))
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading("")
    }
  }

  const signOut = () => { clearApiKey(); router.push("/signup") }
  const regimeColor = signals?.regime.label === "bull" ? "var(--teal)" : signals?.regime.label === "bear" ? "var(--red)" : "var(--amber)"
  const riskData = risk ? Object.entries(risk.factor_contrib ?? {}).map(([factor, value]) => ({ factor, value })).sort((a, b) => b.value - a.value) : []
  const curveData = backtest ? Object.entries(backtest.equity_curve ?? {}).map(([date, equity]) => ({ date, equity: equity * 100, drawdown: ((backtest.drawdown ?? {})[date] ?? 0) * 100 })) : []

  return (
    <main style={{ minHeight: "100vh", maxWidth: 1120, margin: "0 auto", padding: "28px 24px 60px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <Link href="/" style={{ color: "var(--teal)", fontFamily: "var(--mono)", textDecoration: "none", fontWeight: 700 }}>📡 drift</Link>
        <button onClick={signOut} style={{ ...buttonStyle, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>Sign out</button>
      </header>
      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
      <section style={{ ...panelStyle, marginBottom: 18 }}>
        {loading === "usage" && !usage ? <Spinner /> : usage && <>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}><span style={{ fontFamily: "var(--mono)" }}>{usage.email}</span><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ background: usage.tier === "pro" ? "var(--teal)" : "var(--surface)", color: usage.tier === "pro" ? "#fff" : "var(--muted)", border: "1px solid var(--border)", borderRadius: 4, padding: "3px 8px", fontFamily: "var(--mono)", fontSize: 11 }}>{usage.tier === "pro" ? "PRO" : "FREE"}</span><button onClick={refreshUsage} disabled={loading === "usage"} style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 4, padding: "3px 8px", fontFamily: "var(--mono)", fontSize: 11, cursor: loading === "usage" ? "wait" : "pointer" }}>{loading === "usage" ? "Refreshing…" : "Refresh usage"}</button></div></div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0 7px", color: "var(--muted)", fontSize: 12 }}><span>{usage.requests_today} / {usage.daily_limit} requests today</span><span>{usage.remaining} remaining</span></div>
          <div style={{ height: 7, background: "var(--border)", borderRadius: 7, overflow: "hidden" }}><div style={{ width: `${Math.min(100, usage.daily_limit ? usage.requests_today / usage.daily_limit * 100 : 0)}%`, height: "100%", background: "var(--teal)" }} /></div>
        </>}
      </section>
      <section style={{ ...panelStyle, display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ flex: "1 1 480px" }}><input value={tickersInput} onChange={event => setTickersInput(event.target.value)} aria-label="Comma-separated tickers" style={{ width: "100%", padding: "11px 13px", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 5, fontFamily: "var(--mono)" }} /><p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 6 }}>NSE symbols only — e.g. RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN. Free tier: max 5 tickers.</p></div>
        <button onClick={() => run("signals")} disabled={loading === "signals"} style={buttonStyle}>{loading === "signals" ? <Spinner /> : "Run signals"}</button>
      </section>
      <nav style={{ display: "flex", gap: 4, overflowX: "auto" }}>{TABS.map(item => <button key={item} onClick={() => setTab(item)} style={{ padding: "10px 16px", border: "1px solid var(--border)", borderBottom: item === tab ? "1px solid var(--surface)" : "1px solid var(--border)", background: item === tab ? "var(--surface)" : "transparent", color: item === tab ? "var(--teal)" : "var(--muted)", fontFamily: "var(--mono)", cursor: "pointer" }}>{item}</button>)}</nav>
      <section style={{ ...panelStyle, borderTopLeftRadius: 0, minHeight: 320 }}>
        {tab === "Signals" && <SignalsPanel signals={signals} regimeColor={regimeColor} />}
        {tab === "Portfolio" && <><button onClick={() => run("portfolio")} style={buttonStyle}>{loading === "portfolio" ? <Spinner /> : "Optimise (HRP)"}</button>{portfolio && <div style={{ height: 360 }}><ResponsiveContainer><PieChart><Pie data={portfolio.weights} dataKey="weight" nameKey="ticker" cx="50%" cy="50%" outerRadius={115} label={({ name, value }) => `${name} ${pct(Number(value))}`}>{portfolio.weights.map((item, index) => <Cell key={item.ticker} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip formatter={value => pct(Number(value))} /></PieChart></ResponsiveContainer></div>}</>}
        {tab === "Risk" && <><button onClick={() => run("risk")} style={buttonStyle}>{loading === "risk" ? <Spinner /> : "Decompose risk"}</button>{risk && <><div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "22px 0" }}><Metric label="Annualised vol" value={pct(risk.annualised_vol)} /><Metric label="Factor variance" value={pct(risk.total_variance ? risk.factor_variance / risk.total_variance : 0)} /><Metric label="Specific variance" value={pct(risk.total_variance ? risk.specific_variance / risk.total_variance : 0)} /></div><div style={{ height: Math.max(260, riskData.length * 42) }}><ResponsiveContainer><BarChart data={riskData} layout="vertical" margin={{ left: 30 }}><CartesianGrid stroke="var(--border)" /><XAxis type="number" tick={{ fill: "var(--muted)" }} /><YAxis type="category" dataKey="factor" width={100} tick={{ fill: "var(--muted)" }} /><Tooltip /><Bar dataKey="value" fill="var(--teal)" /></BarChart></ResponsiveContainer></div></>}</>}
        {tab === "Backtest" && usage?.tier !== "pro" ? <div style={{ color: "var(--muted)", textAlign: "center", padding: 60 }}>🔒 Backtest requires Pro. <Link href="/pricing" style={{ color: "var(--teal)" }}>Upgrade at /pricing →</Link></div> : tab === "Backtest" && <><button onClick={() => run("backtest")} disabled={loading === "backtest"} style={buttonStyle}>{loading === "backtest" ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Spinner /> Running backtest…</span> : "Run backtest (HRP)"}</button>{backtest?.metrics && <><div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "22px 0" }}><Metric label="Sharpe" value={Number(backtest.metrics.sharpe).toFixed(2)} /><Metric label="PSR" value={pct(Number(backtest.metrics.psr))} /><Metric label="Max drawdown" value={pct(Number(backtest.metrics.max_drawdown))} /><Metric label="Ann. return" value={pct(Number(backtest.metrics.ann_return))} /></div>{curveData.length > 0 ? <div style={{ height: 360 }}><ResponsiveContainer><LineChart data={curveData}><CartesianGrid stroke="var(--border)" /><XAxis dataKey="date" minTickGap={40} tick={{ fill: "var(--muted)", fontSize: 10 }} /><YAxis tick={{ fill: "var(--muted)" }} unit="%" /><Tooltip /><Legend /><Line type="monotone" dataKey="equity" stroke="var(--teal)" dot={false} name="Cumulative return %" /><Line type="monotone" dataKey="drawdown" stroke="var(--red)" dot={false} name="Drawdown %" /></LineChart></ResponsiveContainer></div> : <p style={{ color: "var(--muted)", marginTop: 20 }}>Metrics are ready, but this backtest returned no equity curve.</p>}</>}</>}
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div style={{ flex: "1 1 150px", border: "1px solid var(--border)", borderRadius: 6, padding: 16 }}><div style={{ color: "var(--muted)", fontSize: 11, fontFamily: "var(--mono)" }}>{label}</div><strong style={{ display: "block", marginTop: 8, fontFamily: "var(--mono)", fontSize: 21 }}>{value}</strong></div>
}

function SignalsPanel({ signals, regimeColor }: { signals: SignalResponse | null; regimeColor: string | undefined }) {
  if (!signals) return <p style={{ color: "var(--muted)" }}>Run signals to load live factor data.</p>
  return <><div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 22 }}><span style={{ color: regimeColor, border: `1px solid ${regimeColor}`, borderRadius: 4, padding: "4px 9px", fontFamily: "var(--mono)", fontSize: 11 }}>{signals.regime.label.toUpperCase()}</span><div style={{ display: "flex", flex: "1 1 300px", height: 9, overflow: "hidden", borderRadius: 8 }}>{Object.entries(signals.regime.probabilities).map(([label, probability]) => <div key={label} title={`${label}: ${pct(probability)}`} style={{ width: `${probability * 100}%`, background: label === "bull" ? "var(--teal)" : label === "bear" ? "var(--red)" : "var(--amber)" }} />)}</div></div><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12 }}><thead><tr>{["Ticker", "Composite", "Size", "Momentum", "Beta"].map(label => <th key={label} style={{ padding: 12, textAlign: "left", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{label}</th>)}</tr></thead><tbody>{signals.signals.map(item => { const compositeColor = item.composite !== null && item.composite > .1 ? "var(--teal)" : item.composite !== null && item.composite < -.1 ? "var(--red)" : "var(--muted)"; return <tr key={item.ticker}><td style={{ padding: 12, borderBottom: "1px solid var(--border)" }}>{item.ticker}</td><td style={{ padding: 12, borderBottom: "1px solid var(--border)", color: compositeColor }}>{item.composite?.toFixed(3) ?? "—"}</td>{["size", "momentum", "beta"].map(factor => <td key={factor} style={{ padding: 12, borderBottom: "1px solid var(--border)" }}>{score(item.scores, factor)?.toFixed(3) ?? "—"}</td>)}</tr>})}</tbody></table></div></>
}
