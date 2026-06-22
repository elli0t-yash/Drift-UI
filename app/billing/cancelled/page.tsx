import Link from "next/link"

export default function BillingCancelledPage() {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}><section style={{ maxWidth: 520, padding: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}><h1 style={{ fontFamily: "var(--mono)", fontSize: 24 }}>Payment cancelled. No charges were made.</h1><Link href="/pricing" style={{ display: "inline-block", color: "var(--teal)", marginTop: 20 }}>Back to pricing →</Link></section></main>
}
