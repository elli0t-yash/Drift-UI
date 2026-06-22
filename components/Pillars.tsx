import Link from 'next/link'

export function Pillars() {
  return (
    <section id="math" className="section">
      <div className="sec-label">the mathematics</div>
      <h2 className="sec-h2">Three pillars, derived step by step</h2>
      <p className="sec-sub">
        Every formula is implemented directly. The derivations are in the build history.
      </p>

      <div className="pillars">
        {/* Pillar 1 */}
        <div className="pillar">
          <div>
            <div className="pil-n">Pillar 1 — feature extraction</div>
            <h3 className="pil-h">Cauchy wavelet scattering</h3>
            <p className="pil-p">
              Morlet wavelets decay as exp(−t²). Cauchy wavelets decay algebraically:
              ω^α·exp(−ω) — keeping sensitivity to rare large events that matter in
              financial returns. Second-order coefficients capture volatility-of-volatility
              across pairs of scales. J=8 gives 37 coefficients per stock per date.
            </p>
          </div>
          <div className="eq-block">
            <div><span className="eq-sym">S₀</span><span className="eq-op"> = </span><span className="eq-val">⟨|x|⟩</span></div>
            <div><span className="eq-sym">S₁(j)</span><span className="eq-op"> = </span><span className="eq-val">⟨|x ★ ψ_j|⟩</span></div>
            <div><span className="eq-sym">S₂(j₁,j₂)</span><span className="eq-op"> = </span><span className="eq-val">⟨||x★ψ_{"{j₁}"}|★ψ_{"{j₂}"}|⟩</span></div>
            <div className="eq-cm">1 + 8 + 28 = 37 coefficients (J=8, Q=1)</div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="pillar">
          <div>
            <div className="pil-n">Pillar 2 — signal quality</div>
            <h3 className="pil-h">Rank transform + IC / ICIR</h3>
            <p className="pil-p">
              Derived by solving s(1)=−1, s(N)=+1 as a linear map — two equations, two
              unknowns. ICIR is the Sharpe ratio of the IC time series, filtering signal
              strength from consistency. Negative ICIR gets zero weight in the combiner.
            </p>
          </div>
          <div className="eq-block">
            <div><span className="eq-sym">sᵢ</span><span className="eq-op"> = </span><span className="eq-val">(2rᵢ − N − 1) / (N − 1)</span></div>
            <div><span className="eq-sym">IC_t</span><span className="eq-op"> = </span><span className="eq-val">Spearman(s_t, r_{"{t+h}"})</span></div>
            <div><span className="eq-sym">ICIR</span><span className="eq-op"> = </span><span className="eq-val">IC̄ / σ_IC</span></div>
            <div className="eq-cm">IC &gt; 0.05 decent · IC &gt; 0.10 strong</div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="pillar">
          <div>
            <div className="pil-n">Pillar 3 — portfolio construction</div>
            <h3 className="pil-h">Black-Litterman posterior</h3>
            <p className="pil-p">
              Reverse optimisation backs out equilibrium returns from market-cap weights:
              μ_eq = λΣw_mkt. The posterior is a precision-weighted blend of the CAPM
              prior and IC-derived views. HRP (Ward linkage + recursive bisection) provides
              a matrix-inversion-free fallback when views are noisy.
            </p>
          </div>
          <div className="eq-block">
            <div><span className="eq-sym">μ_eq</span><span className="eq-op"> = </span><span className="eq-val">λ Σ w_mkt</span></div>
            <div><span className="eq-sym">μ_BL</span><span className="eq-op"> = M </span><span className="eq-val">[A μ_eq + Pᵀ Ω⁻¹ q]</span></div>
            <div className="eq-cm">M = [(τΣ)⁻¹ + PᵀΩ⁻¹P]⁻¹</div>
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 28,
        paddingTop: 24,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          Every formula above is fully derived on the math page.
        </span>
        <Link href="/math" style={{
          fontFamily: 'var(--mono)',
          fontSize: 13,
          color: 'var(--teal)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          Read full derivations with step-by-step proofs →
        </Link>
      </div>
    </section>
  )
}
