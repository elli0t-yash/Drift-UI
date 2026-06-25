"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { Disclaimer } from "@/components/Disclaimer"
import { ErrorAlert } from "@/components/ErrorAlert"
import { Navbar } from "@/components/Navbar"
import { Spinner } from "@/components/Spinner"
import { api, type ScreenResponse, type ScreenerRow } from "@/lib/api"
import { useApiKey } from "@/lib/useApiKey"

type Universe = "nifty50" | "nifty100" | "banknifty" | "custom"
type SortBy = "composite" | "momentum" | "quality" | "value" | "risk"

const universes: Array<{ label: string; value: Universe }> = [
  { label: "Nifty 50", value: "nifty50" },
  { label: "Nifty 100", value: "nifty100" },
  { label: "Bank Nifty", value: "banknifty" },
  { label: "Custom", value: "custom" },
]

const sectors = [
  "All Sectors",
  "Energy",
  "Financials",
  "Technology",
  "Consumer Discretionary",
  "Consumer Staples",
  "Healthcare",
  "Industrials",
  "Materials",
  "Real Estate",
  "Utilities",
  "Communication",
  "Conglomerate",
]

const sortOptions: Array<{ label: string; value: SortBy }> = [
  { label: "Composite Score", value: "composite" },
  { label: "Momentum", value: "momentum" },
  { label: "Quality", value: "quality" },
  { label: "Value", value: "value" },
  { label: "Lowest Risk", value: "risk" },
]

const selectStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text)",
  fontFamily: "var(--mono)",
  fontSize: 12,
  padding: "10px 12px",
  minWidth: 170,
  outline: "none",
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "var(--mono)",
  fontSize: 12,
}

const headerCell: CSSProperties = {
  background: "var(--surface)",
  color: "var(--teal)",
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  padding: "11px 10px",
  textAlign: "left",
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
}

const cell: CSSProperties = {
  padding: "11px 10px",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "middle",
}

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

function signed(value: number, digits = 2) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`
}

function pct(value: number, digits = 1) {
  const percent = Math.abs(value) <= 1 ? value * 100 : value
  return `${percent.toFixed(digits)}%`
}

function truncate(text: string) {
  return text.length > 45 ? `${text.slice(0, 45)}...` : text
}

function factorLabel(factor: string) {
  if (factor.toLowerCase() === "quality") return "QAL"
  if (factor.toLowerCase() === "beta") return "BTA"
  return factor.slice(0, 3).toUpperCase()
}

export default function ScreenerPage() {
  const router = useRouter()
  const { apiKey, hasKey, isLoaded } = useApiKey()
  const [universe, setUniverse] = useState<Universe>("nifty50")
  const [sortBy, setSortBy] = useState<SortBy>("composite")
  const [sector, setSector] = useState("All Sectors")
  const [customTickers, setCustomTickers] = useState("")
  const [screen, setScreen] = useState<ScreenResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!hasKey) router.replace("/signup")
  }, [hasKey, isLoaded, router])

  const customList = useMemo(() => customTickers.split(",").map(item => item.trim().toUpperCase()).filter(Boolean), [customTickers])
  const factorColumns = useMemo(() => Object.keys(screen?.results?.[0]?.factor_scores ?? {}), [screen])

  const runScreener = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await api.screen(apiKey, universe, {
        sort_by: sortBy,
        ...(sector !== "All Sectors" ? { sector } : {}),
        ...(universe === "custom" ? { custom_tickers: customList } : {}),
      })
      setScreen(result)
      setExpanded(null)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", maxWidth: 1240, margin: "0 auto", padding: "34px 24px 72px" }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--teal)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
            research terminal
          </div>
          <h1 style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: -0.5 }}>
            NSE Stock Screener
          </h1>
          <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
            Factor-ranked equities across Nifty universes. Signals computed from live Kite Connect data.
          </p>
        </header>

        {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap", overflowX: "auto" }}>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {universes.map(item => {
                const active = item.value === universe
                return (
                  <button
                    key={item.value}
                    onClick={() => setUniverse(item.value)}
                    style={{
                      background: active ? "var(--teal)" : "transparent",
                      border: active ? "1px solid var(--teal)" : "1px solid var(--border)",
                      borderRadius: 999,
                      color: active ? "var(--bg)" : "var(--muted)",
                      cursor: "pointer",
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      fontWeight: active ? 700 : 400,
                      padding: "9px 13px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            <select value={sortBy} onChange={event => setSortBy(event.target.value as SortBy)} style={selectStyle} aria-label="Sort by">
              {sortOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>

            <select value={sector} onChange={event => setSector(event.target.value)} style={selectStyle} aria-label="Sector filter">
              {sectors.map(item => <option key={item} value={item}>{item}</option>)}
            </select>

            <button
              onClick={runScreener}
              disabled={loading}
              style={{
                background: "var(--teal)",
                border: "1px solid var(--teal)",
                borderRadius: 6,
                color: "var(--bg)",
                cursor: loading ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontFamily: "var(--mono)",
                fontSize: 13,
                fontWeight: 700,
                padding: "11px 18px",
                minWidth: 150,
                whiteSpace: "nowrap",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <><Spinner /> Running</> : "Run screener"}
            </button>
          </div>

          {universe === "custom" && (
            <div style={{ marginTop: 14 }}>
              <input
                value={customTickers}
                onChange={event => setCustomTickers(event.target.value)}
                placeholder="RELIANCE, TCS, INFY, HDFCBANK"
                style={{ width: "100%", background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "var(--mono)", fontSize: 12, padding: "10px 12px", outline: "none" }}
              />
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 7 }}>
                Enter NSE symbols separated by commas. Free tier: up to 5 tickers.
              </div>
            </div>
          )}
        </section>

        {screen && <RegimeBanner screen={screen} />}

        <section style={{ background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {loading ? (
            <LoadingState universe={universe} />
          ) : !screen ? (
            <EmptyState />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...headerCell, width: 48 }}>Rank</th>
                    <th style={{ ...headerCell, width: 100 }}>Ticker</th>
                    <th style={{ ...headerCell, width: 120 }}>Sector</th>
                    <th style={{ ...headerCell, width: 80 }}>Composite</th>
                    {factorColumns.map(factor => <th key={factor} style={{ ...headerCell, width: 56 }}>{factorLabel(factor)}</th>)}
                    <th style={{ ...headerCell, width: 72 }}>Ann Vol</th>
                    <th style={{ ...headerCell, width: 64 }}>Regime</th>
                    <th style={{ ...headerCell, width: 88 }}>Class</th>
                    <th style={headerCell}>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {screen.results.map((row, index) => (
                    <ScreenerTableRow
                      key={`${row.rank}-${row.ticker}`}
                      row={row}
                      factorColumns={factorColumns}
                      currentRegime={screen.current_regime}
                      index={index}
                      expanded={expanded === row.ticker}
                      hovered={hovered === row.ticker}
                      onToggle={() => setExpanded(expanded === row.ticker ? null : row.ticker)}
                      onHover={value => setHovered(value ? row.ticker : null)}
                    />
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "0 16px 16px" }}>
                <Disclaimer />
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

function RegimeBanner({ screen }: { screen: ScreenResponse }) {
  const regime = screen.current_regime
  const isBull = regime === "bull"
  const isBear = regime === "bear"
  const label = isBull ? "🟢 Bull market" : isBear ? "🔴 Bear market" : "🟡 Sideways"
  const background = isBull ? "rgba(0,200,150,0.06)" : isBear ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)"
  const border = isBull ? "rgba(0,200,150,0.2)" : isBear ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ background, border: `1px solid ${border}`, borderRadius: 8, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 5 }}>{label}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{pct(screen.regime_confidence, 0)} confidence · as of {screen.as_of}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <StatPill>{screen.shown} of {screen.total_passed_filters} stocks shown</StatPill>
          {screen.skipped_tickers.length > 0 && <StatPill>{screen.skipped_tickers.length} skipped</StatPill>}
          {screen.is_truncated && <StatPill color="var(--amber)">Free — top 10 only</StatPill>}
        </div>
      </div>
      {screen.is_truncated && (
        <div style={{ marginTop: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
          Upgrade to Pro to see all {screen.total_passed_filters} results and unlock advanced filters{" "}
          <Link href="/pricing" style={{ color: "var(--teal)", textDecoration: "none" }}>→</Link>
        </div>
      )}
    </div>
  )
}

function StatPill({ children, color = "var(--muted)" }: { children: ReactNode; color?: string }) {
  return <span style={{ border: "1px solid var(--border)", borderRadius: 999, color, fontFamily: "var(--mono)", fontSize: 11, padding: "5px 9px", background: "var(--surface)" }}>{children}</span>
}

function ScreenerTableRow({
  row,
  factorColumns,
  currentRegime,
  index,
  expanded,
  hovered,
  onToggle,
  onHover,
}: {
  row: ScreenerRow
  factorColumns: string[]
  currentRegime: ScreenResponse["current_regime"]
  index: number
  expanded: boolean
  hovered: boolean
  onToggle: () => void
  onHover: (value: boolean) => void
}) {
  const compositeColor = row.composite_score > 0.1 ? "var(--teal)" : row.composite_score < -0.1 ? "var(--red)" : "var(--text)"
  const volColor = row.annualised_vol > 0.4 ? "var(--red)" : row.annualised_vol > 0.25 ? "var(--amber)" : "var(--muted)"
  const rowBackground = hovered ? "rgba(0,200,150,0.04)" : index % 2 === 0 ? "var(--surface)" : "var(--code-bg)"
  const classStyle = classificationStyle(row.classification)
  const totalColumns = factorColumns.length + 8

  return (
    <>
      <tr onClick={onToggle} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)} style={{ background: rowBackground, cursor: "pointer" }}>
        <td style={{ ...cell, width: 48, color: "var(--muted)" }}>{row.rank}</td>
        <td style={{ ...cell, width: 100, color: "var(--text)", fontWeight: 700 }}>{row.ticker}</td>
        <td style={{ ...cell, width: 120 }}>
          <span style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 3, padding: "2px 6px", fontSize: 10, color: "var(--muted)" }}>{row.sector}</span>
        </td>
        <td style={{ ...cell, width: 80, color: compositeColor, fontWeight: 700 }}>{signed(row.composite_score)}</td>
        {factorColumns.map(factor => {
          const value = row.factor_scores[factor] ?? 0
          const color = value > 0.2 ? "var(--teal)" : value < -0.2 ? "var(--red)" : "var(--muted)"
          return <td key={factor} style={{ ...cell, width: 56, color }}>{signed(value)}</td>
        })}
        <td style={{ ...cell, width: 72, color: volColor }}>{pct(row.annualised_vol)}</td>
        <td style={{ ...cell, width: 64 }}>
          <span title={row.regime_compatible ? "Compatible" : `Incompatible with current ${currentRegime} regime`} style={{ color: row.regime_compatible ? "var(--teal)" : "var(--red)", fontSize: 15 }}>●</span>
        </td>
        <td style={{ ...cell, width: 88 }}>
          <span style={classStyle}>{row.classification}</span>
        </td>
        <td style={{ ...cell, color: "var(--muted)", fontSize: 11, minWidth: 260 }}>{truncate(row.why)}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={totalColumns} style={{ background: "var(--code-bg)", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 280px" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  WHY RANKED HERE
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--teal)" }}>
                  {row.why}
                </div>
              </div>
              <div style={{ flex: "1 1 280px" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  RISK NOTE
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--amber)" }}>
                  {row.risk_note}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function classificationStyle(classification: ScreenerRow["classification"]): CSSProperties {
  if (classification === "candidate") {
    return { background: "rgba(0,200,150,0.12)", border: "1px solid rgba(0,200,150,0.3)", color: "var(--teal)", borderRadius: 4, padding: "3px 7px", fontSize: 10 }
  }
  if (classification === "watchlist") {
    return { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "var(--amber)", borderRadius: 4, padding: "3px 7px", fontSize: 10 }
  }
  return { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--red)", borderRadius: 4, padding: "3px 7px", fontSize: 10 }
}

function LoadingState({ universe }: { universe: Universe }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <Spinner />
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", marginTop: 16 }}>
        Running Drift factor engine across {universe} universe...
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 8, opacity: 0.6 }}>
        First run fetches live Kite data (~20-30s). Subsequent runs use cache (&lt;5s).
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 32, marginBottom: 16 }}>📡</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--text)", marginBottom: 8 }}>
        Select a universe and run the screener
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
        Factor signals computed from live NSE data via Kite Connect. Results ranked by IC-weighted composite score.
      </div>
    </div>
  )
}
