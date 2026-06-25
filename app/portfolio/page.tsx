"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Disclaimer } from "@/components/Disclaimer"
import { ErrorAlert } from "@/components/ErrorAlert"
import { Navbar } from "@/components/Navbar"
import { Spinner } from "@/components/Spinner"
import { api, type PortfolioAnalysis, type Tier } from "@/lib/api"
import { useApiKey } from "@/lib/useApiKey"

type InputTab = "csv" | "manual"
type ResultTab = "Overview" | "Holdings" | "Factor exposure" | "Risk" | "Correlation" | "Rebalance"
type ManualRow = { ticker: string; weight: string }
type Usage = { email: string; tier: Tier; requests_today: number; daily_limit: number; remaining: number; total_calls: number }

const RESULT_TABS: ResultTab[] = ["Overview", "Holdings", "Factor exposure", "Risk", "Correlation", "Rebalance"]
const COLORS = ["var(--teal)", "var(--indigo)", "var(--amber)", "var(--red)", "var(--muted)"]
const panelStyle: CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 22 }
const buttonStyle: CSSProperties = { border: 0, borderRadius: 6, padding: "11px 18px", background: "var(--teal)", color: "var(--surface)", fontFamily: "var(--mono)", fontWeight: 700, cursor: "pointer" }
const inputStyle: CSSProperties = { width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13, padding: "9px 10px", outline: "none" }
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12 }
const thStyle: CSSProperties = { textAlign: "left", borderBottom: "1px solid var(--border)", color: "var(--muted)", padding: 12, whiteSpace: "nowrap" }
const tdStyle: CSSProperties = { borderBottom: "1px solid var(--border)", padding: 12, verticalAlign: "top" }

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

function displayPct(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  const pct = Math.abs(value) <= 1 ? value * 100 : value
  return `${pct.toFixed(digits)}%`
}

function displayNum(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return value.toFixed(digits)
}

function normaliseWeights(weights: Record<string, number>) {
  const clean = Object.fromEntries(Object.entries(weights).filter(([, weight]) => Number.isFinite(weight) && weight > 0))
  const total = Object.values(clean).reduce((sum, weight) => sum + weight, 0)
  if (!total) return {}
  return Object.fromEntries(Object.entries(clean).map(([ticker, weight]) => [ticker, weight / total * 100]))
}

export default function PortfolioPage() {
  const router = useRouter()
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const { apiKey, hasKey, isLoaded } = useApiKey()
  const [usage, setUsage] = useState<Usage | null>(null)
  const [inputTab, setInputTab] = useState<InputTab>("csv")
  const [resultTab, setResultTab] = useState<ResultTab>("Overview")
  const [csvWeights, setCsvWeights] = useState<Record<string, number>>({})
  const [manualRows, setManualRows] = useState<ManualRow[]>([
    { ticker: "RELIANCE", weight: "25" },
    { ticker: "TCS", weight: "20" },
    { ticker: "INFY", weight: "20" },
  ])
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [lastWeights, setLastWeights] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoaded) return
    if (!hasKey) return router.replace("/signup")
    api.me(apiKey).then(setUsage).catch(() => setUsage(null))
  }, [apiKey, hasKey, isLoaded, router])

  const manualWeights = useMemo(() => {
    const weights: Record<string, number> = {}
    for (const row of manualRows) {
      const ticker = row.ticker.trim().toUpperCase()
      const weight = parseFloat(row.weight.trim())
      if (ticker && Number.isFinite(weight)) weights[ticker] = weight
    }
    return weights
  }, [manualRows])

  const activeWeights = inputTab === "csv" ? csvWeights : manualWeights
  const totalWeight = Object.values(activeWeights).reduce((sum, weight) => sum + weight, 0)
  const hasHoldings = Object.keys(activeWeights).length > 0 && totalWeight > 0

  const parseCsv = async (file: File | null) => {
    if (!file) return
    setError("")
    const text = await file.text()
    const lines = text.trim().split("\n")
    const weights: Record<string, number> = {}
    for (const line of lines.slice(1)) {
      const [ticker, weight] = line.split(",")
      if (ticker && weight) {
        weights[ticker.trim().toUpperCase()] = parseFloat(weight.trim())
      }
    }
    setCsvWeights(weights)
  }

  const runAnalysis = async (weightsOverride?: Record<string, number>) => {
    const weights = normaliseWeights(weightsOverride ?? activeWeights)
    if (!Object.keys(weights).length) return setError("Enter at least one holding with a positive weight.")
    setLoading(true)
    setError("")
    try {
      const result = await api.analyzePortfolio(apiKey, weights)
      setLastWeights(weights)
      setAnalysis(result)
      setResultTab("Overview")
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = async () => {
    if (!analysis || usage?.tier !== "pro") return
    setPdfLoading(true)
    setError("")
    try {
      const blob = await api.downloadReport(apiKey, lastWeights)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `drift-portfolio-${analysis.as_of}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", maxWidth: 1180, margin: "0 auto", padding: "34px 24px 70px" }}>
        {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

        <section style={{ ...panelStyle, marginBottom: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 32, color: "var(--text)" }}>Analyse your portfolio</h1>
            <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 14 }}>Upload a CSV or enter holdings manually.</p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {(["csv", "manual"] as InputTab[]).map(item => (
              <button
                key={item}
                onClick={() => setInputTab(item)}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  background: inputTab === item ? "var(--teal)" : "var(--surface)",
                  color: inputTab === item ? "var(--surface)" : "var(--muted)",
                  padding: "8px 13px",
                  cursor: "pointer",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                }}
              >
                {item === "csv" ? "CSV upload" : "Manual entry"}
              </button>
            ))}
          </div>

          {inputTab === "csv" ? (
            <div>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={event => parseCsv(event.target.files?.[0] ?? null)}
                style={{ ...inputStyle, cursor: "pointer" }}
              />
              <pre style={{ marginTop: 12, padding: 14, borderRadius: 6, border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, overflowX: "auto" }}>
{`Expected CSV format:
ticker,weight
RELIANCE,25
TCS,20
INFY,20
HDFCBANK,20
ICICIBANK,15`}
              </pre>
            </div>
          ) : (
            <ManualEntry rows={manualRows} setRows={setManualRows} />
          )}

          <div style={{ marginTop: 22 }}>
            <div style={{ color: totalWeight >= 95 && totalWeight <= 105 ? "var(--teal)" : "var(--amber)", fontFamily: "var(--mono)", fontSize: 13, marginBottom: 12 }}>
              Total: {totalWeight.toFixed(1)}%
            </div>
            <button
              onClick={() => runAnalysis()}
              disabled={!hasHoldings || loading}
              style={{ ...buttonStyle, width: "100%", opacity: !hasHoldings || loading ? 0.55 : 1, cursor: !hasHoldings || loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            >
              {loading ? <><Spinner /> Running Drift pipeline... fetching data, computing signals, analysing risk.</> : "Analyse portfolio"}
            </button>
            <p style={{ margin: "10px 0 0", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>Free tier: up to 5 holdings · Pro: up to 50</p>
          </div>
        </section>

        {analysis && (
          <section ref={resultsRef} style={{ ...panelStyle }}>
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 22, color: "var(--text)" }}>
                Portfolio Analysis — {analysis.n_holdings} holdings · as of {analysis.as_of}
              </h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => runAnalysis(lastWeights)} disabled={loading} style={{ ...buttonStyle, background: "var(--surface)", color: "var(--teal)", border: "1px solid var(--teal)" }}>
                  ↻ Re-analyse
                </button>
                {usage?.tier === "pro" ? (
                  <button onClick={downloadPdf} disabled={pdfLoading} style={{ ...buttonStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {pdfLoading ? <><Spinner /> Generating PDF</> : "⬇ Download PDF"}
                  </button>
                ) : (
                  <Link href="/pricing" title="Requires Pro" style={{ ...buttonStyle, textDecoration: "none", display: "inline-block" }}>
                    ⬇ Download PDF
                  </Link>
                )}
              </div>
            </header>

            <nav style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 22 }}>
              {RESULT_TABS.map(item => (
                <button key={item} onClick={() => setResultTab(item)} style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 4, background: item === resultTab ? "var(--surface)" : "transparent", color: item === resultTab ? "var(--teal)" : "var(--muted)", fontFamily: "var(--mono)", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {item}
                </button>
              ))}
            </nav>

            {resultTab === "Overview" && <OverviewTab analysis={analysis} />}
            {resultTab === "Holdings" && <HoldingsTab analysis={analysis} />}
            {resultTab === "Factor exposure" && <FactorExposureTab analysis={analysis} />}
            {resultTab === "Risk" && <RiskTab analysis={analysis} />}
            {resultTab === "Correlation" && <CorrelationTab analysis={analysis} />}
            {resultTab === "Rebalance" && <RebalanceTab analysis={analysis} />}
            <Disclaimer />
          </section>
        )}
      </main>
    </>
  )
}

function ManualEntry({ rows, setRows }: { rows: ManualRow[]; setRows: (rows: ManualRow[]) => void }) {
  const update = (index: number, patch: Partial<ManualRow>) => setRows(rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row))
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Ticker</th><th style={thStyle}>Weight (%)</th><th style={thStyle}>Remove</th></tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={tdStyle}><input value={row.ticker} onChange={event => update(index, { ticker: event.target.value.toUpperCase() })} style={inputStyle} /></td>
              <td style={tdStyle}><input value={row.weight} onChange={event => update(index, { weight: event.target.value })} style={inputStyle} /></td>
              <td style={tdStyle}><button onClick={() => setRows(rows.filter((_, rowIndex) => rowIndex !== index))} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--muted)", cursor: "pointer", padding: "7px 11px" }}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setRows([...rows, { ticker: "", weight: "" }])} style={{ ...buttonStyle, marginTop: 14, background: "var(--surface)", color: "var(--teal)", border: "1px solid var(--teal)" }}>Add holding</button>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <div style={{ flex: "1 1 180px", border: "1px solid var(--border)", borderRadius: 7, padding: 16 }}><div style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>{label}</div><strong style={{ display: "block", marginTop: 8, color: "var(--text)", fontFamily: "var(--mono)", fontSize: 22 }}>{value}</strong></div>
}

function OverviewTab({ analysis }: { analysis: PortfolioAnalysis }) {
  const regime = analysis.current_regime || analysis.regime_impact.current_regime
  const border = regime === "bull" ? "var(--teal)" : regime === "bear" ? "var(--red)" : "var(--amber)"
  const background = regime === "bull" ? "rgba(0,200,150,0.08)" : regime === "bear" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)"
  const icon = regime === "bull" ? "🟢" : regime === "bear" ? "🔴" : "🟠"
  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard label="Annualised Vol" value={displayPct(analysis.annualised_vol)} />
        <MetricCard label="Max Drawdown" value={displayPct(analysis.max_drawdown)} />
        <MetricCard label="Sharpe Ratio" value={displayNum(analysis.sharpe)} />
        <MetricCard label="Effective N" value={displayNum(analysis.effective_n, 1)} />
      </div>
      <div style={{ marginTop: 20, border: `1px solid ${border}`, background, borderRadius: 8, padding: 16 }}>
        <div style={{ color: border, fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700 }}>{icon} {regime} market — {displayPct(analysis.regime_confidence || analysis.regime_impact.confidence, 0)} confidence</div>
        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 13 }}>{analysis.regime_impact.recommendation}</p>
      </div>
      {analysis.warnings.length > 0 && <div style={{ marginTop: 20 }}><h3 style={{ color: "var(--amber)", fontFamily: "var(--mono)", fontSize: 14 }}>⚠ Risk flags</h3><ul style={{ color: "var(--amber)", fontFamily: "var(--mono)", fontSize: 12 }}>{analysis.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></div>}
    </>
  )
}

function HoldingsTab({ analysis }: { analysis: PortfolioAnalysis }) {
  const factors = Array.from(new Set(analysis.holdings.flatMap(holding => Object.keys(holding.factor_scores ?? {}))))
  const pieData = analysis.holdings.map(holding => ({ ticker: holding.ticker, weight: holding.weight }))
  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead><tr>{["Ticker", "Weight", "Composite", ...factors, "Vol Contrib", "Status"].map(label => <th key={label} style={thStyle}>{label}</th>)}</tr></thead>
          <tbody>
            {analysis.holdings.map(holding => {
              const compositeColor = holding.composite !== null && holding.composite > 0.1 ? "var(--teal)" : holding.composite !== null && holding.composite < -0.1 ? "var(--red)" : "var(--muted)"
              return <tr key={holding.ticker}>
                <td style={tdStyle}>{holding.ticker}</td>
                <td style={tdStyle}>{displayPct(holding.weight)}</td>
                <td style={{ ...tdStyle, color: compositeColor }}>{displayNum(holding.composite, 3)}</td>
                {factors.map(factor => <td key={factor} style={tdStyle}>{displayNum(holding.factor_scores?.[factor], 3)}</td>)}
                <td style={tdStyle}>{displayPct(holding.vol_contrib)}</td>
                <td style={tdStyle}>{holding.is_helping ? <span style={{ color: "var(--teal)" }}>✓ Helping</span> : holding.risk_flags.length > 0 ? <span style={{ color: "var(--amber)" }}>⚠ Risk</span> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
      <div style={{ height: 360, marginTop: 24 }}>
        <ResponsiveContainer><PieChart><Pie data={pieData} dataKey="weight" nameKey="ticker" cx="50%" cy="50%" outerRadius={110} label={({ name, value }) => `${name} ${displayPct(Number(value))}`}>{pieData.map((item, index) => <Cell key={item.ticker} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={value => displayPct(Number(value))} /><Legend /></PieChart></ResponsiveContainer>
      </div>
    </>
  )
}

function FactorExposureTab({ analysis }: { analysis: PortfolioAnalysis }) {
  const data = Object.entries(analysis.factor_exposure ?? {}).map(([factor, value]) => ({ factor, value }))
  return (
    <>
      <div style={{ height: Math.max(280, data.length * 48) }}>
        <ResponsiveContainer><BarChart data={data} layout="vertical" margin={{ left: 38 }}><CartesianGrid stroke="var(--border)" /><XAxis type="number" domain={[-1, 1]} tick={{ fill: "var(--muted)" }} /><YAxis type="category" dataKey="factor" width={120} tick={{ fill: "var(--muted)" }} /><ReferenceLine x={0} stroke="var(--muted)" /><Tooltip /><Bar dataKey="value">{data.map(item => <Cell key={item.factor} fill={item.value >= 0 ? "var(--teal)" : "var(--red)"} />)}</Bar></BarChart></ResponsiveContainer>
      </div>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Factor</th><th style={thStyle}>Exposure</th><th style={thStyle}>Direction</th></tr></thead>
        <tbody>{data.map(item => <tr key={item.factor}><td style={tdStyle}>{item.factor}</td><td style={tdStyle}>{displayNum(item.value, 3)}</td><td style={tdStyle}>{item.value > 0.05 ? "Long" : item.value < -0.05 ? "Short" : "Neutral"}</td></tr>)}</tbody>
      </table>
    </>
  )
}

function RiskTab({ analysis }: { analysis: PortfolioAnalysis }) {
  const risk = analysis.risk_decomposition
  const factorPct = risk.total_variance ? risk.factor_variance / risk.total_variance : 0
  const specificPct = risk.total_variance ? risk.specific_variance / risk.total_variance : 0
  const data = Object.entries(risk.factor_contrib ?? {}).map(([factor, value]) => ({ factor, value })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><MetricCard label="Factor risk" value={displayPct(factorPct)} /><MetricCard label="Specific risk" value={displayPct(specificPct)} /></div>
      <div style={{ height: Math.max(280, data.length * 44), marginTop: 22 }}><ResponsiveContainer><BarChart data={data} layout="vertical" margin={{ left: 38 }}><CartesianGrid stroke="var(--border)" /><XAxis type="number" tick={{ fill: "var(--muted)" }} /><YAxis type="category" dataKey="factor" width={120} tick={{ fill: "var(--muted)" }} /><Tooltip /><Bar dataKey="value" fill="var(--teal)" /></BarChart></ResponsiveContainer></div>
      {analysis.stress_results.length > 0 && <div style={{ marginTop: 24 }}><h3 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 14 }}>Stress test — historical scenarios</h3><div style={{ overflowX: "auto" }}><table style={tableStyle}><thead><tr>{["Scenario", "Total Return", "Max Drawdown", "Ann Vol"].map(label => <th key={label} style={thStyle}>{label}</th>)}</tr></thead><tbody>{analysis.stress_results.map(item => <tr key={item.scenario}><td style={tdStyle}>{item.scenario}</td><td style={{ ...tdStyle, color: item.total_return >= 0 ? "var(--teal)" : "var(--red)" }}>{displayPct(item.total_return)}</td><td style={{ ...tdStyle, color: "var(--red)" }}>{displayPct(item.max_drawdown)}</td><td style={tdStyle}>{displayPct(item.ann_vol)}</td></tr>)}</tbody></table></div></div>}
    </>
  )
}

function CorrelationTab({ analysis }: { analysis: PortfolioAnalysis }) {
  return (
    <>
      {analysis.correlation_clusters.length > 0 && <div style={{ marginBottom: 24 }}><h3 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 14 }}>Correlated clusters — consider reducing redundancy</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>{analysis.correlation_clusters.map((cluster, index) => <div key={index} style={{ border: "1px solid var(--border)", borderRadius: 7, padding: 15 }}><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>{cluster.tickers.map(ticker => <span key={ticker} style={{ border: "1px solid var(--teal)", color: "var(--teal)", borderRadius: 999, padding: "3px 8px", fontFamily: "var(--mono)", fontSize: 11 }}>{ticker}</span>)}</div><div style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 12 }}>Avg correlation: {displayNum(cluster.avg_corr, 2)}</div><p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>{cluster.note}</p></div>)}</div></div>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard label="HHI" value={displayNum(analysis.concentration.hhi, 3)} />
        <MetricCard label="Effective N" value={displayNum(analysis.concentration.effective_n, 1)} />
        <MetricCard label="Max single weight" value={displayPct(analysis.concentration.max_weight)} />
        <MetricCard label="Top-3 weight" value={displayPct(analysis.concentration.top3_weight)} />
      </div>
      <p style={{ marginTop: 16, color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>HHI &lt; 0.15 = well diversified · 0.15–0.25 = moderate concentration · &gt; 0.25 = high concentration</p>
    </>
  )
}

function RebalanceTab({ analysis }: { analysis: PortfolioAnalysis }) {
  const current = Object.fromEntries(analysis.holdings.map(holding => [holding.ticker, holding.weight]))
  const suggested = analysis.rebalance.suggested_weights ?? {}
  const tickers = Array.from(new Set([...Object.keys(current), ...Object.keys(suggested)]))
  return (
    <>
      <h3 style={{ marginTop: 0, color: "var(--text)", fontFamily: "var(--mono)", fontSize: 15 }}>HRP rebalance suggestion</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <MetricCard label="Current effective N" value={displayNum(analysis.rebalance.effective_n_current, 1)} />
        <MetricCard label="After rebalance" value={displayNum(analysis.rebalance.effective_n_suggested, 1)} />
        <MetricCard label="Improvement" value={`+${displayNum(analysis.rebalance.improvement, 1)} holdings`} />
      </div>
      <div style={{ overflowX: "auto" }}><table style={tableStyle}><thead><tr>{["Ticker", "Current weight", "Suggested weight", "Change"].map(label => <th key={label} style={thStyle}>{label}</th>)}</tr></thead><tbody>{tickers.map(ticker => { const change = (suggested[ticker] ?? 0) - (current[ticker] ?? 0); return <tr key={ticker}><td style={tdStyle}>{ticker}</td><td style={tdStyle}>{displayPct(current[ticker] ?? 0)}</td><td style={tdStyle}>{displayPct(suggested[ticker] ?? 0)}</td><td style={{ ...tdStyle, color: change >= 0 ? "var(--teal)" : "var(--red)" }}>{change >= 0 ? "+" : ""}{displayPct(change)}</td></tr> })}</tbody></table></div>
      <p style={{ marginTop: 16, color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>Weights are computed using Hierarchical Risk Parity (HRP). This is a suggestion only — consult a registered advisor before rebalancing.</p>
    </>
  )
}
