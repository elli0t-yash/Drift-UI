"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Disclaimer } from "@/components/Disclaimer"
import { ErrorAlert } from "@/components/ErrorAlert"
import { Navbar } from "@/components/Navbar"
import { Spinner } from "@/components/Spinner"
import { api, type SignalResponse } from "@/lib/api"
import { useApiKey } from "@/lib/useApiKey"

const SAMPLE = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "BHARTIARTL", "HINDUNILVR", "AXISBANK", "KOTAKBANK"]
const regimes = ["bull", "sideways", "bear"] as const

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

const colorFor = (regime: string) => regime === "bull" ? "var(--teal)" : regime === "bear" ? "var(--red)" : "var(--amber)"
const rgbaFor = (regime: string, alpha: number) => regime === "bull" ? `rgba(0,200,150,${alpha})` : regime === "bear" ? `rgba(239,68,68,${alpha})` : `rgba(245,158,11,${alpha})`
const labelFor = (regime: string) => regime === "bull" ? "🟢  Bull Market" : regime === "bear" ? "🔴  Bear Market" : "🟡  Sideways Market"

function interpretation(regime: string) {
  if (regime === "bear") return "The HMM model detects a bear regime. Momentum signals are suppressed — Barroso & Santa-Clara (2015) documented momentum crashes occur during reversals following bear markets. Quality and low-beta factors are most reliable."
  if (regime === "sideways") return "Markets are in a sideways consolidation regime. Value and quality signals are most predictive. Momentum signals have reduced reliability. Volatility-targeting is recommended."
  return "The HMM model has classified the current market state as bullish based on log-returns, realised volatility, and vol-of-vol features. Momentum signals are active and predictive. Factor ICIR for momentum is at its highest reliability level."
}

function pct(value: number | undefined, digits = 0) {
  return `${((value ?? 0) * 100).toFixed(digits)}%`
}

export default function RegimePage() {
  const router = useRouter()
  const { apiKey, hasKey, isLoaded } = useApiKey()
  const [signals, setSignals] = useState<SignalResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    setError("")
    try {
      setSignals(await api.signals(apiKey, SAMPLE))
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    if (!isLoaded) return
    if (!hasKey) return router.replace("/signup")
    load()
  }, [hasKey, isLoaded, load, router])

  const regime = signals?.regime.label ?? "sideways"
  const probabilities = signals?.regime.probabilities ?? {}
  const active = regime === "bull" ? ["Momentum", "Profitability", "Quality"] : regime === "bear" ? ["Quality", "Value", "Low Beta"] : ["Value", "Quality", "Size"]
  const suppressed = regime === "bull" ? [] : regime === "bear" ? ["Momentum"] : ["Momentum (reduced reliability)"]
  const strategies = [
    ["Momentum", "✓ Strong", "✗ Avoid", "~ Weak"],
    ["Quality", "✓ Good", "✓ Strong", "✓ Good"],
    ["Value", "~ Weak", "✓ Good", "✓ Strong"],
    ["Low Volatility", "~ Neutral", "✓ Strong", "✓ Good"],
    ["HRP Portfolio", "✓ Good", "✓ Good", "✓ Good"],
    ["Equal Weight", "~ Neutral", "✗ Risky", "~ Neutral"],
  ]

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", maxWidth: 1120, margin: "0 auto", padding: "34px 24px 70px" }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--teal)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>LIVE MARKET INTELLIGENCE</div>
          <h1 style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Regime Detection</h1>
          <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", maxWidth: 760 }}>HMM-based market state classification using 3 hidden states: bull, bear, and sideways. Updated on every request from live Kite data.</p>
        </header>

        {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
        {loading && !signals ? <div style={{ padding: 80, textAlign: "center" }}><Spinner /></div> : signals && (
          <>
            <section style={{ background: `linear-gradient(135deg, ${rgbaFor(regime, 0.08)}, ${rgbaFor(regime, 0.03)})`, border: `1px solid ${rgbaFor(regime, 0.25)}`, borderRadius: 12, padding: 28, display: "flex", gap: 28, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 560px" }}>
                <div style={{ color: colorFor(regime), fontFamily: "var(--mono)", fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>{labelFor(regime)}</div>
                <div style={{ marginTop: 12, color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>{pct(Math.max(...Object.values(probabilities)))} model confidence</div>
                <div style={{ marginTop: 5, color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>as of {signals.as_of}</div>
                <div style={{ height: 1, background: "var(--border)", margin: "22px 0" }} />
                <p style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.8, margin: 0 }}>{interpretation(regime)}</p>
              </div>
              <div style={{ flex: "1 1 320px", display: "grid", gap: 18, alignContent: "center" }}>
                {regimes.map(item => <ProbabilityBar key={item} label={item} value={probabilities[item] ?? 0} />)}
              </div>
            </section>

            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 22 }}>
              <SignalColumn title="Active signals" border="var(--teal)" items={active} active />
              <SignalColumn title="Suppressed signals" border={regime === "bear" ? "var(--red)" : "var(--amber)"} items={suppressed} />
            </section>

            <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginTop: 22, overflowX: "auto" }}>
              <h2 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 16, marginTop: 0 }}>Strategy compatibility</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12 }}>
                <thead><tr>{["Strategy", "Bull", "Bear", "Sideways"].map(label => <th key={label} style={{ textAlign: "left", color: "var(--teal)", borderBottom: "1px solid var(--border)", padding: 12, background: label.toLowerCase() === regime ? "rgba(0,200,150,0.06)" : "transparent" }}>{label}</th>)}</tr></thead>
                <tbody>{strategies.map(row => <tr key={row[0]}>{row.map((item, index) => <td key={item} style={{ padding: 12, borderBottom: "1px solid var(--border)", color: item.startsWith("✓") ? "var(--teal)" : item.startsWith("✗") ? "var(--red)" : index === 0 ? "var(--text)" : "var(--muted)", background: ["", "bull", "bear", "sideways"][index] === regime ? "rgba(0,200,150,0.06)" : "transparent" }}>{item}</td>)}</tr>)}</tbody>
              </table>
            </section>

            <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginTop: 22 }}>
              <button onClick={() => setOpen(!open)} style={{ background: "transparent", border: 0, color: "var(--teal)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 14, padding: 0 }}>{open ? "▾" : "▸"} How regime detection works</button>
              {open && <p style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre-line" }}>{`Drift fits a 3-state Gaussian HMM to three daily features derived from the Nifty 50 benchmark:

1. Log-return: daily log price change
2. Realised volatility: 21-day rolling std of returns
3. Vol-of-vol: 21-day rolling std of the vol series

The Baum-Welch EM algorithm estimates the model parameters. The Viterbi algorithm decodes the most likely hidden state sequence. States are labelled bull/bear/sideways by sorting the fitted Gaussian means by expected return.

The forward algorithm computes P(O|λ) in O(K²T) time — exponentially faster than brute-force enumeration. For K=3 states and T=252 trading days: 2,268 operations vs 3^252 ≈ 10^120 by exhaustive search.`}</p>}
            </section>

            <button onClick={load} disabled={loading} style={{ marginTop: 24, background: "var(--teal)", border: 0, borderRadius: 6, color: "var(--surface)", cursor: loading ? "wait" : "pointer", fontFamily: "var(--mono)", fontWeight: 700, padding: "11px 18px", display: "inline-flex", gap: 8, alignItems: "center" }}>{loading ? <Spinner /> : "↻ Refresh regime data"}</button>
          </>
        )}
        <Disclaimer />
      </main>
    </>
  )
}

function ProbabilityBar({ label, value }: { label: "bull" | "bear" | "sideways"; value: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 52px", alignItems: "center", gap: 10 }}>
      <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11, textTransform: "capitalize" }}>{label}</span>
      <span style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}><span style={{ display: "block", width: `${value * 100}%`, height: "100%", background: colorFor(label) }} /></span>
      <span style={{ color: colorFor(label), fontFamily: "var(--mono)", fontSize: 11, textAlign: "right" }}>{pct(value)}</span>
    </div>
  )
}

function SignalColumn({ title, border, items, active = false }: { title: string; border: string; items: string[]; active?: boolean }) {
  return (
    <div style={{ background: "var(--surface)", border: `1px solid ${border}`, borderRadius: 8, padding: 18 }}>
      <h2 style={{ margin: "0 0 14px", color: "var(--text)", fontFamily: "var(--mono)", fontSize: 15 }}>{title}</h2>
      {items.length === 0 ? <div style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>All factors active</div> : items.map(item => <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--border)" }}><span style={{ color: active ? "var(--text)" : "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>{active ? "●" : "○"} · {item}</span><span style={{ color: active ? "var(--teal)" : border, fontFamily: "var(--mono)", fontSize: 10 }}>{active ? "Reliable" : "Suppressed"}</span></div>)}
    </div>
  )
}
