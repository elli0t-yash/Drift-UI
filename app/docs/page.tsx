"use client"

import Link from "next/link"
import { useState, type CSSProperties, type ReactNode } from "react"
import { Navbar } from "@/components/Navbar"

const BASE = "https://drift-api-production-4337.up.railway.app"
const codeStyle: CSSProperties = { background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 14, color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.8, overflowX: "auto", whiteSpace: "pre" }
const card: CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 22, marginBottom: 18 }

const endpoints = [
  { method: "POST", path: "/auth/signup", tier: "FREE + PRO", desc: "Issue an API key for an email address.", request: '{ "email": "you@example.com" }', response: '{ "key": "dk_free_...", "tier": "free" }' },
  { method: "GET", path: "/auth/me", tier: "FREE + PRO", desc: "Check key usage and tier. Headers: X-API-Key required.", request: "No request body", response: '{ "email": "...", "tier": "free", "requests_today": 3, "daily_limit": 50 }' },
  { method: "POST", path: "/signals/compute", tier: "FREE (5 tickers) · PRO (50 tickers)", desc: "Compute IC-weighted factor signals and detect market regime.", request: '{ "tickers": ["RELIANCE", "TCS", "INFY"], "provider": "kite", "benchmark": "^NSEI" }', response: '{ "regime": { "label": "bull", ... }, "signals": [...], "factors": [...] }' },
  { method: "POST", path: "/portfolio/analyze", tier: "FREE (5 holdings) · PRO (50 holdings)", desc: "Full factor/risk decomposition of a portfolio. Returns holdings analysis, concentration metrics, correlation clusters, stress test, and HRP rebalance suggestion.", request: '{ "weights": { "RELIANCE": 25, "TCS": 20, "INFY": 20, "HDFCBANK": 20, "ICICIBANK": 15 } }', response: '{ "annualised_vol": 0.18, "sharpe": 0.70, "holdings": [...], "rebalance": {...}, ... }' },
  { method: "POST", path: "/portfolio/report", tier: "PRO ONLY", desc: "Generate a downloadable PDF report. Returns application/pdf binary.", request: 'Same as /portfolio/analyze', response: "Binary PDF file" },
  { method: "POST", path: "/screen", tier: "FREE (top 10) · PRO (all results)", desc: "Screen a named NSE universe by factor scores. Returns ranked stocks with classification.", request: '{ "universe": "nifty50", "sort_by": "composite", "provider": "kite" }', response: '{ "results": [...], "current_regime": "bull", "is_truncated": false, ... }' },
  { method: "POST", path: "/portfolio/optimise", tier: "FREE (5 tickers, HRP only) · PRO (50 tickers, all methods)", desc: "Optimise portfolio weights using HRP, Black-Litterman, or CVaR.", request: '{ "tickers": ["RELIANCE", "TCS"], "method": "hrp" }', response: '{ "weights": [...], "effective_n": 1.9 }' },
]

const authCode = `curl ${BASE}/auth/me \\
  -H "X-API-Key: dk_free_your_key_here"`

const pythonCode = `import requests

BASE = "${BASE}"
KEY  = "dk_free_your_key_here"

def drift(path, body):
    return requests.post(
        f"{BASE}{path}",
        json=body,
        headers={"X-API-Key": KEY}
    ).json()

# Compute signals
signals = drift("/signals/compute", {
    "tickers": ["RELIANCE", "TCS", "INFY"],
    "provider": "kite"
})
print(signals["regime"]["label"])   # "bull"

# Analyse portfolio
report = drift("/portfolio/analyze", {
    "weights": {"RELIANCE": 30, "TCS": 40, "INFY": 30}
})
print(report["annualised_vol"])     # 0.18`

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "64px 24px 80px" }}>
        <header style={{ marginBottom: 44 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--teal)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>DEVELOPER REFERENCE</div>
          <h1 style={{ fontFamily: "var(--mono)", fontSize: 40, color: "var(--text)", margin: "0 0 12px" }}>Drift API</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8, maxWidth: 740 }}>REST API for systematic alpha research. All endpoints require an X-API-Key header. Base URL: {BASE}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
            <Link href="/signup" style={button("var(--teal)", "var(--surface)", "var(--teal)")}>Get a free key</Link>
            <Link href="https://github.com/elli0t-yash" target="_blank" rel="noreferrer" style={button("transparent", "var(--teal)", "var(--teal)")}>View on GitHub ↗</Link>
          </div>
        </header>

        <Section title="Authentication">
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8 }}>Pass your key in the X-API-Key header for every authenticated request.</p>
          <CodeBlock code={authCode} />
        </Section>

        <Section title="Endpoints reference">
          {endpoints.map(endpoint => <Endpoint key={endpoint.path} {...endpoint} />)}
        </Section>

        <Section title="Python quickstart">
          <CodeBlock code={pythonCode} />
        </Section>

        <Section title="Rate limits">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12 }}>
              <thead><tr>{["Tier", "Requests/day", "Max tickers", "PDF reports"].map(label => <th key={label} style={{ color: "var(--teal)", textAlign: "left", padding: 12, borderBottom: "1px solid var(--border)" }}>{label}</th>)}</tr></thead>
              <tbody>
                <tr>{["Free", "50", "5", "—"].map(item => <td key={item} style={{ color: "var(--muted)", padding: 12, borderBottom: "1px solid var(--border)" }}>{item}</td>)}</tr>
                <tr>{["Pro", "2,000", "50", "✓"].map(item => <td key={item} style={{ color: item === "✓" ? "var(--teal)" : "var(--muted)", padding: 12, borderBottom: "1px solid var(--border)" }}>{item}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <Link href="/pricing" style={{ display: "inline-block", marginTop: 16, color: "var(--teal)", fontFamily: "var(--mono)", fontSize: 12, textDecoration: "none" }}>View pricing →</Link>
        </Section>
      </main>
    </>
  )
}

function Endpoint({ method, path, tier, desc, request, response }: { method: string; path: string; tier: string; desc: string; request: string; response: string }) {
  return (
    <article style={card}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ background: method === "GET" ? "var(--teal)" : "var(--indigo)", color: "var(--surface)", borderRadius: 4, padding: "4px 8px", fontFamily: "var(--mono)", fontSize: 11 }}>{method}</span>
        <code style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 15 }}>{path}</code>
        <span style={{ marginLeft: "auto", color: "var(--amber)", border: "1px solid var(--border)", borderRadius: 999, padding: "4px 8px", fontFamily: "var(--mono)", fontSize: 10 }}>{tier}</span>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.8 }}>{desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <div><Label>Request body</Label><CodeBlock code={request} compact /></div>
        <div><Label>Response shape</Label><CodeBlock code={response} compact /></div>
      </div>
    </article>
  )
}

function CodeBlock({ code, compact = false }: { code: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ position: "relative" }}>
      <button onClick={copy} style={{ position: "absolute", top: 8, right: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, color: copied ? "var(--teal)" : "var(--muted)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10, padding: "4px 7px" }}>{copied ? "Copied!" : "Copy"}</button>
      <pre style={{ ...codeStyle, paddingTop: compact ? 34 : 42 }}>{highlight(code)}</pre>
    </div>
  )
}

function highlight(code: string) {
  return code.split(/("(?:[^"\\]|\\.)*")/g).map((part, index) => {
    if (!part.startsWith('"')) return part
    const isKey = code.slice(code.indexOf(part) + part.length).trimStart().startsWith(":")
    return <span key={`${part}-${index}`} style={{ color: isKey ? "var(--teal)" : "var(--amber)" }}>{part}</span>
  })
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section style={{ marginBottom: 48 }}><h2 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 24 }}>{title}</h2>{children}</section>
}

function Label({ children }: { children: ReactNode }) {
  return <div style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>{children}</div>
}

function button(background: string, color: string, border: string): CSSProperties {
  return { background, color, border: `1px solid ${border}`, borderRadius: 6, padding: "10px 14px", textDecoration: "none", fontFamily: "var(--mono)", fontSize: 13 }
}
