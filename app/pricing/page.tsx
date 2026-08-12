"use client"

import Link from "next/link"
import { Disclaimer } from "@/components/Disclaimer"
import { Navbar } from "@/components/Navbar"

const FEATURES = [
  "Unlimited requests",
  "Unlimited tickers per request",
  "Full 15-layer quantitative pipeline",
  "All 7 factor signals (momentum, beta, size, value, profitability, investment, quality)",
  "Regime-aware factor weighting (HMM + co-movement graph)",
  "Full screener (all ranked stocks, <150 ms)",
  "All optimisers: HRP, Black-Litterman (endo. Ω), CVaR",
  "Risk decomposition (BARRA model) + stress tests",
  "Walk-forward backtest access (PSR, DSR)",
  "Wavelet Scattering Transform stability filter",
  "PDF research reports",
  "Dedicated support + SLA",
  "Custom data integrations on request",
]

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", maxWidth: 640, margin: "0 auto", padding: "72px 24px" }}>
        <h1 style={{ fontFamily: "var(--mono)", fontSize: 36, textAlign: "center", margin: "42px 0 10px" }}>Custom pricing</h1>
        <p style={{ color: "var(--muted)", textAlign: "center", marginBottom: 36 }}>Contract-based access. Reach out to discuss terms, volume, and onboarding.</p>

        <section style={{ padding: 30, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--teal)" }}>
          <div style={{ fontFamily: "var(--mono)", color: "var(--teal)", fontSize: 12 }}>CUSTOM CONTRACT</div>
          <h2 style={{ fontFamily: "var(--mono)", fontSize: 30, margin: "12px 0 4px" }}>Contact us</h2>
          <p style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 12, marginBottom: 24 }}>Pricing negotiated per engagement</p>
          <ul style={{ listStyle: "none", display: "grid", gap: 12, color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
            {FEATURES.map(feature => (
              <li key={feature} style={{ color: "var(--teal)" }}><span>✓</span> {feature}</li>
            ))}
          </ul>
          <div style={{ marginTop: 28 }}>
            <a
              href="mailto:shekhawatsamvardhan@gmail.com?subject=Drift%20Custom%20Pricing%20Enquiry"
              className="nav-cta"
              style={{ display: "block", padding: 11, textAlign: "center" }}
            >
              Get in touch →
            </a>
          </div>
        </section>

        <Disclaimer variant="full" />
      </main>
    </>
  )
}
