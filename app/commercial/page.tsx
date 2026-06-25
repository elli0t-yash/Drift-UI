import Link from "next/link"
import type React from "react"
import { Navbar } from "@/components/Navbar"

const mail = "mailto:yash01012002@gmail.com"
const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 22 }

export default function CommercialPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 24px 80px" }}>
        <section style={{ marginBottom: 62 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--teal)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>COMMERCIAL LICENSING</div>
          <h1 style={{ fontFamily: "var(--mono)", fontSize: 40, color: "var(--text)", lineHeight: 1.15, margin: "0 0 18px" }}>Deploy Drift inside your platform.</h1>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, maxWidth: 720 }}>A separate commercial license is available for firms that cannot comply with AGPL-3.0 or need private deployment, custom factors, or white-labeling.</p>
        </section>

        <Section title="Who uses commercial licenses">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16 }}>
            {[
              ["PMS firms", "Run systematic factor analysis for your entire AUM"],
              ["Family offices", "Private deployment, custom universes, white-labeled reports"],
              ["Fintech platforms", "Embed Drift's API into your product without AGPL obligations"],
              ["Broker platforms", "Add research analytics to your trading interface"],
              ["Research desks", "Custom factor models, proprietary data integrations"],
              ["Prop trading firms", "Private deployment, SLA support, institutional-grade uptime"],
            ].map(([title, body]) => <div key={title} style={card}><h3 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 15 }}>{title}</h3><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.8 }}>{body}</p></div>)}
          </div>
        </Section>

        <Section title="Commercial license includes">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "0 28px" }}>
            {["Commercial use without AGPL source disclosure", "Private deployment on your infrastructure", "White-label reports (your branding)", "Custom factor model integration", "Proprietary data vendor connectors", "API access with custom rate limits", "Dedicated support (response SLA)", "Quarterly strategy review calls", "Priority feature requests", "NDA available on request"].map(item => <div key={item} style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13, borderBottom: "1px solid var(--border)", padding: "13px 0" }}><span style={{ color: "var(--teal)" }}>✓</span> {item}</div>)}
          </div>
        </Section>

        <Section title="Pricing tiers">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <Tier title="Startup" price="₹2L / year" items={["Up to 5 users", "Single deployment", "Email support"]} cta="Contact us" />
            <Tier title="Growth" price="₹6L / year" items={["Up to 25 users", "Up to 3 deployments", "White-label reports", "Priority support"]} cta="Contact us" highlight />
            <Tier title="Enterprise" price="Custom pricing" items={["Unlimited users", "Custom deployment", "Custom factors", "SLA + dedicated support"]} cta="Book a call" />
          </div>
        </Section>

        <section style={{ ...card, border: "1px solid var(--teal)" }}>
          <h2 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 24, marginTop: 0 }}>Get in touch</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8 }}>Tell us about your use case and we'll send you a commercial license proposal within 2 business days.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            <Link href={mail} style={button("var(--teal)", "var(--surface)", "var(--teal)")}>Email directly →</Link>
            <Link href="https://www.linkedin.com/in/mishra-yash2002/" target="_blank" rel="noreferrer" style={button("transparent", "var(--teal)", "var(--teal)")}>LinkedIn ↗</Link>
          </div>
          <p style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.8, marginTop: 22 }}>Drift is dual-licensed. Research and academic use is free under AGPL-3.0. Commercial use inside proprietary products requires a separate commercial license.</p>
          <a href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank" rel="noreferrer" style={{ color: "var(--teal)", fontFamily: "var(--mono)", fontSize: 12, textDecoration: "none" }}>Read AGPL-3.0 license text ↗</a>
        </section>
      </main>
    </>
  )
}

function button(background: string, color: string, border: string) {
  return { background, color, border: `1px solid ${border}`, borderRadius: 6, padding: "10px 14px", textDecoration: "none", fontFamily: "var(--mono)", fontSize: 13 }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ marginBottom: 58 }}><h2 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 24, marginBottom: 22 }}>{title}</h2>{children}</section>
}

function Tier({ title, price, items, cta, highlight = false }: { title: string; price: string; items: string[]; cta: string; highlight?: boolean }) {
  return <div style={{ ...card, border: highlight ? "1px solid var(--teal)" : "1px solid var(--border)" }}><div style={{ color: highlight ? "var(--teal)" : "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>{title}</div><h3 style={{ color: "var(--text)", fontFamily: "var(--mono)", fontSize: 26 }}>{price}</h3><ul style={{ color: "var(--muted)", fontSize: 13, lineHeight: 2 }}>{items.map(item => <li key={item}>{item}</li>)}</ul><Link href={mail} style={button(highlight ? "var(--teal)" : "transparent", highlight ? "var(--surface)" : "var(--teal)", "var(--teal)")}>{cta}</Link></div>
}
