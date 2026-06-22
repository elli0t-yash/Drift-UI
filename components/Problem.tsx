const PROBLEMS = [
  {
    n:  '01',
    h:  'Returns are fat-tailed. Your model isn\'t.',
    p:  'Pearson correlation assumes normality. A single earnings shock flips the IC sign. Rank transformation removes the sensitivity entirely.',
    eq: 'IC = Spearman(s_t, r_{t+h})',
  },
  {
    n:  '02',
    h:  'Sample covariance collapses when N → T.',
    p:  'When assets approach observations, eigenvalues hit zero. Matrix inversion amplifies noise. Ledoit-Wolf analytical shrinkage is mandatory, not optional.',
    eq: 'Σ̂ = α · F + (1−α) · S',
  },
  {
    n:  '03',
    h:  'Regimes change. Your signal doesn\'t know.',
    p:  'Momentum has negative IC in bear regimes. HMM regime detection gates which signals are active in each market state.',
    eq: 'α_{t+1}(j) = B_j · Σ_k α_t(k) A_{kj}',
  },
]

export function Problem() {
  return (
    <section className="section">
      <div className="sec-label">the problem</div>
      <h2 className="sec-h2">Three ways traditional quant fails</h2>
      <p className="sec-sub">Each failure has a mathematical cause and a mathematical fix.</p>

      <div className="prob-grid">
        {PROBLEMS.map((p) => (
          <div key={p.n} className="prob-card">
            <div className="prob-n">{p.n}</div>
            <h3>{p.h}</h3>
            <p>{p.p}</p>
            <div className="prob-eq">{p.eq}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
