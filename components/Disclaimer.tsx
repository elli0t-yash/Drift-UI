interface Props {
  variant?: "full" | "short"
}

const FULL = `Drift is a quantitative research and analytics platform. All outputs — including factor scores, portfolio analysis, regime classifications, and rebalance suggestions — are for research and informational purposes only. They do not constitute investment advice, a recommendation to buy or sell any security, or a solicitation of any investment advisory services. Past performance does not guarantee future results. Factor signals are derived from historical price data and may not predict future performance. Consult a SEBI-registered Investment Adviser before making investment decisions.`

const SHORT = `Research purposes only. Not investment advice. Consult a SEBI-registered adviser before acting on any output.`

export function Disclaimer({ variant = "short" }: Props) {
  const full = variant === "full"

  return (
    <div style={{
      background: "rgba(100,116,139,0.06)",
      border: "1px solid rgba(100,116,139,0.15)",
      borderRadius: 6,
      padding: full ? "14px 18px" : "8px 14px",
      fontFamily: "var(--mono)",
      fontSize: full ? 11 : 10,
      color: "var(--muted)",
      lineHeight: 1.6,
      marginTop: full ? 32 : 12,
    }}>
      {full ? FULL : SHORT}
    </div>
  )
}
