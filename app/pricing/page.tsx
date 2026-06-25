"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Disclaimer } from "@/components/Disclaimer"
import { ErrorAlert } from "@/components/ErrorAlert"
import { Navbar } from "@/components/Navbar"
import { Spinner } from "@/components/Spinner"
import { api } from "@/lib/api"
import { useApiKey } from "@/lib/useApiKey"

const FREE = ["50 requests/day", "Up to 5 tickers per request", "Factor signals (size, momentum, beta)", "Portfolio optimisation (HRP)", "No backtest access", "No risk decomposition"]
const PRO = ["2,000 requests/day", "Up to 50 tickers per request", "All factor signals", "All optimisers (HRP, Black-Litterman, CVaR)", "Backtest access (PSR, DSR, drawdown)", "Risk decomposition (BARRA model)", "Priority support"]

export default function PricingPage() {
  const { apiKey, hasKey, isLoaded } = useApiKey()
  const [email, setEmail] = useState("")
  const [showEmail, setShowEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isLoaded && hasKey) api.me(apiKey).then(result => setEmail(result.email)).catch(() => undefined)
  }, [apiKey, hasKey, isLoaded])

  const checkout = async () => {
    if (!email.trim()) {
      setShowEmail(true)
      setError("Enter the email associated with your Drift account.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const result = await api.checkout(email.trim())
      window.location.href = result.checkout_url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.")
      setLoading(false)
    }
  }

  const card = (title: string, price: string, features: string[], pro = false) => (
    <section style={{ flex: "1 1 310px", padding: 30, borderRadius: 10, background: "var(--surface)", border: `1px solid ${pro ? "var(--teal)" : "var(--border)"}` }}>
      <div style={{ fontFamily: "var(--mono)", color: pro ? "var(--teal)" : "var(--muted)", fontSize: 12 }}>{title}</div>
      <h2 style={{ fontFamily: "var(--mono)", fontSize: 30, margin: "12px 0 24px" }}>{price}<span style={{ color: "var(--muted)", fontSize: 13 }}>/month</span></h2>
      <ul style={{ listStyle: "none", display: "grid", gap: 12, color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
        {features.map(feature => {
          const absent = feature.startsWith("No ")
          return <li key={feature} style={{ color: absent ? "var(--muted)" : "var(--teal)", opacity: absent ? 0.6 : 1 }}><span>{absent ? "✗" : "✓"}</span> {feature}</li>
        })}
      </ul>
      {pro ? (
        <div style={{ marginTop: 28 }}>
          {(showEmail || !hasKey) && <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Billing email" style={{ width: "100%", marginBottom: 10, padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "var(--mono)" }} />}
          <button onClick={checkout} disabled={loading} className="nav-cta" style={{ width: "100%", padding: 11, border: 0, cursor: loading ? "wait" : "pointer" }}>{loading ? <Spinner /> : "Upgrade to Pro"}</button>
        </div>
      ) : <Link href="/signup" className="nav-cta" style={{ display: "block", marginTop: 28, padding: 11, textAlign: "center" }}>Get started free</Link>}
    </section>
  )

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", maxWidth: 850, margin: "0 auto", padding: "72px 24px" }}>
        <h1 style={{ fontFamily: "var(--mono)", fontSize: 36, textAlign: "center", margin: "42px 0 10px" }}>Simple research access</h1>
        <p style={{ color: "var(--muted)", textAlign: "center", marginBottom: 36 }}>Start free. Upgrade when your research needs more capacity.</p>
        {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>{card("FREE", "₹0", FREE)}{card("PRO", "₹4,999", PRO, true)}</div>
        <Disclaimer variant="full" />
      </main>
    </>
  )
}
