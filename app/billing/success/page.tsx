import Link from "next/link"

export default function BillingSuccessPage() {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}><section style={{ maxWidth: 560, padding: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}><h1 style={{ fontFamily: "var(--mono)", fontSize: 24 }}>✅ Payment successful — your account has been upgraded to Pro.</h1><p style={{ color: "var(--muted)", margin: "18px 0", lineHeight: 1.7 }}>Your API key tier updates automatically within a few minutes via our billing webhook.</p><Link href="/dashboard" style={{ color: "var(--teal)" }}>Open dashboard →</Link></section></main>
}
