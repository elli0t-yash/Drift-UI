import Link from "next/link"
import type React from "react"
import { Disclaimer } from "@/components/Disclaimer"
import { Navbar } from "@/components/Navbar"

const mail = "mailto:yash01012002@gmail.com"
const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 22 }
const primary = { background: "var(--teal)", color: "var(--surface)", border: "1px solid var(--teal)" }
const outline = { background: "transparent", color: "var(--teal)", border: "1px solid var(--teal)" }

export default function AdvisorPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 24px 80px" }}>
        <section style={{ marginBottom: 70 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--teal)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>FOR WEALTH ADVISORS & PMS TEAMS</div>
          <h1 style={{ fontFamily: "var(--mono)", fontSize: 40, fontWeight: 700, color: "var(--text)", maxWidth: 780, lineHeight: 1.15, margin: "0 0 18px" }}>Professional portfolio analytics for your client conversations.</h1>
          <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 560, lineHeight: 1.8 }}>Upload a client portfolio. Get a factor-decomposed, risk-attributed, regime-aware research report in minutes. Branded output ready to forward.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
            <Button href="/portfolio" style={primary}>Analyse a portfolio</Button>
            <Button href="/screener" style={outline}>Try NSE screener</Button>
            <Button href="/advisor#sample" style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border)" }}>View sample report</Button>
            <Button href={mail} style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 12 }}>Request commercial license</Button>
          </div>
        </section>

        <Section title="What your clients are actually asking">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <Problem icon="📊" title="Why is my portfolio underperforming?">Factor exposure analysis shows exactly which systematic risks are driving outcomes — size, momentum, quality, beta — and how much each contributes.</Problem>
            <Problem icon="⚠" title="Am I taking too much risk?">BARRA-style risk decomposition separates factor risk from specific risk. Correlation clustering surfaces hidden redundancies between holdings.</Problem>
            <Problem icon="🔄" title="Should I rebalance?">HRP rebalance suggestions improve effective diversification with a clear before/after comparison. Downloadable PDF ready to share.</Problem>
          </div>
        </Section>

        <Section title="Three steps to a client-ready report">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <Step n="1" title="Upload holdings CSV">ticker, weight columns. Or enter manually.</Step>
            <Step n="2" title="Drift runs the pipeline">Factor signals, risk decomposition, regime analysis, stress test, HRP rebalance — all automated.</Step>
            <Step n="3" title="Download PDF report">Professional output with methodology note and compliance disclaimer included.</Step>
          </div>
        </Section>

        <Section title="What the report includes" id="sample">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "0 28px" }}>
            {["Executive summary with key metrics", "Holdings table with factor scores", "Factor exposure breakdown (7 factors)", "BARRA-style risk decomposition", "Correlation clusters and redundancy flags", "Historical stress test (GFC, COVID, rate shock)", "HRP rebalance suggestion with improvement metric", "Regime analysis and strategy compatibility"].map(item => <div key={item} style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--border)", padding: "14px 0", color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13 }}><span style={{ color: "var(--teal)" }}>✓</span>{item}</div>)}
          </div>
        </Section>

        <Section title="Advisor pricing">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            <Price title="Free" price="₹0/month" href="/signup" cta="Get started free" items={["50 requests/day", "Up to 5 holdings per analysis", "Factor signals + regime", "Web dashboard only", "No PDF export"]} />
            <Price title="Advisor" price="₹4,999/month" href="/pricing" cta="Start advisor plan" highlight items={["2,000 requests/day", "Up to 50 holdings per analysis", "Full factor + risk decomposition", "PDF report export", "Stress testing (GFC, COVID, rate shock)", "HRP rebalance suggestions", "Priority support"]} />
          </div>
          <p style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, marginTop: 22 }}>Need commercial license for deployment inside your platform or firm? Contact us for custom pricing. <a href={mail} style={{ color: "var(--teal)", textDecoration: "none" }}>Request commercial license →</a></p>
        </Section>

        <Disclaimer variant="full" />
      </main>
    </>
  )
}

function Button({ href, children, style }: { href: string; children: React.ReactNode; style: React.CSSProperties }) {
  return <Link href={href} style={{ ...style, borderRadius: 6, padding: "10px 16px", fontFamily: "var(--mono)", fontSize: 13, textDecoration: "none" }}>{children}</Link>
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return <section id={id} style={{ marginBottom: 58 }}><h2 style={{ fontFamily: "var(--mono)", color: "var(--text)", fontSize: 24, marginBottom: 22 }}>{title}</h2>{children}</section>
}

function Problem({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return <div style={card}><div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div><h3 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 15 }}>{title}</h3><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.8 }}>{children}</p></div>
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return <div style={card}><div style={{ color: "var(--teal)", fontFamily: "var(--mono)", fontSize: 28, marginBottom: 10 }}>{n}</div><h3 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 15 }}>{title}</h3><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.8 }}>{children}</p></div>
}

function Price({ title, price, items, href, cta, highlight = false }: { title: string; price: string; items: string[]; href: string; cta: string; highlight?: boolean }) {
  return <div style={{ ...card, border: highlight ? "1px solid var(--teal)" : "1px solid var(--border)" }}><div style={{ color: highlight ? "var(--teal)" : "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>{title}</div><h3 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 28 }}>{price}</h3><ul style={{ color: "var(--muted)", fontSize: 13, lineHeight: 2 }}>{items.map(item => <li key={item}>{item}</li>)}</ul><Link href={href} style={{ display: "inline-block", marginTop: 12, color: highlight ? "var(--surface)" : "var(--teal)", background: highlight ? "var(--teal)" : "transparent", border: "1px solid var(--teal)", borderRadius: 6, padding: "10px 14px", textDecoration: "none", fontFamily: "var(--mono)", fontSize: 12 }}>{cta}</Link></div>
}
