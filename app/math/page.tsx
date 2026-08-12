import Link from 'next/link'
import type { Metadata } from 'next'
import { MathSidebar } from '@/components/MathSidebar'

export const metadata: Metadata = {
  title: 'Drift — Mathematical foundations',
  description:
    'Full derivations for the 15-layer Drift pipeline. ' +
    'Rank transform, IC/ICIR, regime co-movement graph, self-calibrating Black-Litterman (endogenous Ω), ' +
    'wavelet scattering stability, HRP, CVaR, PSR/DSR — all derived from first principles.',
}

function Eq({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'var(--mono)', fontSize: 13, background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px 20px', margin: '16px 0', lineHeight: 2.2, overflowX: 'auto' }}>{children}</div>
}
function Val({ c }: { c: string }) { return <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{c}</span> }
function Sym({ c }: { c: string }) { return <span style={{ color: 'var(--text)', fontWeight: 500 }}>{c}</span> }
function Cm({ c }: { c: string }) { return <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>{c}</div> }
function Insight({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'rgba(0,200,150,.06)', border: '1px solid rgba(0,200,150,.2)', borderRadius: 6, padding: '14px 18px', margin: '20px 0', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--teal)', lineHeight: 1.7 }}>{children}</div>
}
function Note({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'rgba(129,140,248,.06)', border: '1px solid rgba(129,140,248,.2)', borderRadius: 6, padding: '14px 18px', margin: '20px 0', fontSize: 13, color: 'var(--indigo)', lineHeight: 1.7 }}>{children}</div>
}
function H3({ c }: { c: string }) { return <h3 style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '28px 0 10px' }}>{c}</h3> }
function P({ c }: { c: string }) { return <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14 }}>{c}</p> }
function Ls({ id, n, col, title, children }: { id: string; n: string; col: string; title: string; children: React.ReactNode }) {
  return <section id={id} style={{ padding: '64px 0', borderTop: '1px solid var(--border)' }}>
    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: col, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 10 }}>{n}</div>
    <h2 style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 28, letterSpacing: -.5 }}>{title}</h2>
    {children}
  </section>
}

export default function MathPage() {
  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">📡 drift</Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">← Home</Link>
          {['l1','l2a','l3','l4a','l5','l6'].map(id => (
            <a key={id} href={`#${id}`} className="nav-link">{id.toUpperCase()}</a>
          ))}
        </div>
      </nav>

      <div className="math-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        <MathSidebar />

        <main style={{ paddingTop: 48, paddingBottom: 120 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--teal)', letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 12 }}>mathematical foundations</div>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: 34, fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: -1 }}>The mathematics of Drift</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, maxWidth: 560, marginBottom: 48 }}>Full derivations for every formula in the 15-layer pipeline. Each section explains the problem, derives the solution from first principles, and notes how it maps to source code. Includes the Drift 2.0 upgrades: endogenous Ω, co-movement graph regimes, vectorized WST, and the corrected BL view construction.</p>

          <Ls id="l1" n="Layer 1" col="#00C896" title="Returns — data ingestion and contracts">
            <H3 c="Simple and log returns" />
            <P c="For price P_{i,t}: simple return r_{i,t} = P_{i,t}/P_{i,t-1} − 1; log return ℓ_{i,t} = log(1 + r_{i,t}). Log returns are used wherever stationarity and additivity are required (regime features, wavelets). Simple returns measure outcomes." />
            <H3 c="The forward-return contract (Axiom 2)" />
            <P c="The forward return R_{i,t,h} = P_{i,t+h}/P_{i,t} − 1 peeks into the future. By Axiom 2 it may only appear in evaluation code (IC analysis, backtests, matured view errors) — never in signal generation. The default horizon h = 21 trading days (≈ one month). A CI property test enforces this boundary." />
            <H3 c="The precomputed FeatureStore" />
            <P c="Data is fetched via a fully asynchronous engine from Zerodha Kite, paced exactly at the broker rate limit. All screener math is precomputed at dawn and serialized into memory-mapped Arrow tables. A user request does zero network calls and zero pandas math — the OS maps the file into RAM directly. Fallback: if a snapshot is stale or the universe is custom, the live async pipeline runs without blocking other requests." />
            <Insight>Key invariant: the DataLoader is the only file in the codebase that knows the broker exists. All layers above receive a clean (date, ticker) MultiIndex DataFrame. The async engine and FeatureStore are the only layer that knows about Zerodha Kite.</Insight>
          </Ls>

          <Ls id="l2a" n="Layer 2" col="#818CF8" title="Factor Direction & Rank Transform — cross-sectional signal construction">
            <H3 c="The rank transform — derivation from first principles" />
            <P c="We want a function mapping ranks r ∈ {1..N} linearly to scores s ∈ {−1,+1}. Write the linear form s = a·r + b. Two boundary conditions pin the two unknowns:" />
            <Eq>
              <div>s(1) = −1  →  <Val c="a·1 + b = −1" /></div>
              <div>s(N) = +1  →  <Val c="a·N + b = +1" /></div>
            </Eq>
            <P c="Subtract the first equation from the second — b cancels:" />
            <Eq><div><Val c="a(N−1) = 2  →  a = 2/(N−1)" /></div></Eq>
            <P c="Substitute back to find b, then combine over a common denominator:" />
            <Eq>
              <div><Val c="sᵢ = (2rᵢ − N − 1) / (N − 1)" /></div>
              <Cm c="Verify: r=1 → (2−N−1)/(N−1) = −1 ✓  ·  r=N → (N−1)/(N−1) = +1 ✓" />
            </Eq>
            <Insight>The rank transform is outlier-proof by construction. An outlier at +∞ gets the same score (+1.00) as a value at rank N. The z-score of that outlier would be +∞.</Insight>
            <H3 c="The seven factors" />
            <P c="Fama-French 5 factors: Market beta (systematic risk), Size (−log mktcap), Value (B/M ratio), Profitability (ROE), Investment (−asset_growth). Plus Momentum (12-1 month return, skip most recent month per Jegadeesh & Titman 1993) and Quality (composite z-score of ROE, low leverage, low earnings volatility per Asness et al. 2019)." />
          </Ls>

          <Ls id="l2b" n="Layer 4" col="#818CF8" title="Regime-Aware Factor Weighting — HMM + co-movement graph">
            <H3 c="The computational problem" />
            <P c="For K=3 states and T=252 trading days, brute-force enumeration of all state sequences requires K^T = 3^252 ≈ 10^120 operations. The forward algorithm reduces this to O(K²T) via dynamic programming." />
            <H3 c="The forward variable (forward-filtered, not smoothed)" />
            <P c="Define α_t(k) = P(o₁,...,o_t, s_t = k | λ) — the probability of seeing observations up to t AND being in state k at t." />
            <Eq>
              <div><Sym c="Initialisation: " /><Val c="α₁(k) = π_k · B_k(o₁)" /></div>
              <div><Sym c="Recursion: " /><Val c="α_{t+1}(j) = B_j(o_{t+1}) · Σ_k [α_t(k) · A_{kj}]" /></div>
              <div><Sym c="Termination: " /><Val c="P(O|λ) = Σ_k α_T(k)" /></div>
              <Cm c="B_j is outside the sum — emission depends only on the destination state, not the path. This is the Markov property." />
            </Eq>
            <Note>Drift 2.0 uses forward-filtered (not smoothed) probabilities. The legacy model used smoothed probabilities where every historical date knew the future. A CI property test enforces point-in-time integrity: appending future data must not change any earlier filtered probability.</Note>
            <H3 c="The co-movement graph upgrade (6-dim embedding)" />
            <P c="The most reliable crisis precursor is not the index falling — it is correlations tightening before it falls. Drift 2.0 builds a daily co-movement map of ~11 sectors and injects a 6-dimensional embedding g_t into the HMM emission space: (1) mean pairwise correlation ρ̄_t; (2) Absorption Ratio AR_t = Σ_{k=1}^m θ_k / Σ θ_k (Kritzman et al. 2011); (3) Fiedler value λ₂ of the normalized graph Laplacian — how hard the market network is to cut in two; (4) normalized MST length L̄_t (Mantegna 1999); (5) participation ratio PR_t = (Σ v_{1,i}⁴)⁻¹; (6) lead-lag asymmetry ‖Λ−Λᵀ‖_F / ‖Λ+Λᵀ‖_F." />
            <H3 c="Regime-blended factor weights" />
            <Eq>
              <div><Val c="w_{f,t} = 0.60 · w_f^{ICIR} + 0.40 · w_{f,t}^{regime}" /></div>
              <Cm c="Leg 1 (long-run reliability): ICIR-proportional weights. Leg 2 (current-regime preference): state-conditional mean IC, shrunk with James–Stein pseudo-count." />
            </Eq>
            <H3 c="Why StandardScaler is mandatory" />
            <P c="log_return, realised_vol, vol_of_vol, and the 6 co-movement features differ in scale by orders of magnitude. Without scaling, Baum-Welch EM collapses all observations into one state. That state's covariance is well-estimated; the minority states have near-zero observations, their covariance matrices become rank-deficient, and the Cholesky decomposition inside the Gaussian emission fails." />
          </Ls>

          <Ls id="l2c" n="Layer 6" col="#818CF8" title="Wavelet Scattering Stability — path-stability score">
            <H3 c="Why the modulus is essential" />
            <P c="A complex wavelet ψ_j is a bandpass filter. The raw convolution x★ψ_j oscillates at the centre frequency with zero mean — averaging gives nothing. The modulus |x★ψ_j| strips the oscillation and gives the instantaneous amplitude envelope — slowly varying, non-negative, convolvable at the next scale." />
            <P c="Without modulus: S₂ = x★ψ_j₁★ψ_j₂ is just another bandpass filter (composition of linear operators = linear operator). With modulus: S₂ captures how energy at scale j₁ modulates energy at scale j₂ — a genuinely non-linear feature." />
            <H3 c="Cauchy vs Morlet" />
            <Eq>
              <div><Sym c="Morlet: " /><Val c="ψ̂(ω) ∝ exp(−(ω−ω₀)²/2σ²)" /><Sym c="  (Gaussian decay, fast)" /></div>
              <div><Sym c="Cauchy: " /><Val c="ψ̂(ω) ∝ ω^α · exp(−ω/ω_j)" /><Sym c="  (algebraic decay, slower)" /></div>
              <Cm c="α=4 in Drift · higher α → closer to Morlet · lower α → heavier tails, more sensitive to large events" />
            </Eq>
            <P c="Financial returns are fat-tailed. A Morlet wavelet damps a 10σ return the same as a 3σ return at the same frequency. A Cauchy wavelet retains sensitivity to the 10σ event — exactly the information that matters for systematic risk." />
            <H3 c="The scattering cascade" />
            <Eq>
              <div><Val c="S₀ = ⟨|x|⟩" /><Sym c="  →  1 coefficient" /></div>
              <div><Val c="S₁(j) = ⟨|x★ψ_j|⟩" /><Sym c="  →  J=8 coefficients" /></div>
              <div><Val c="S₂(j₁,j₂) = ⟨||x★ψ_j₁|★ψ_j₂|⟩" /><Sym c="  →  C(8,2)=28 coefficients  (j₁ &lt; j₂)" /></div>
              <Cm c="Total: 1 + 8 + 28 = 37  ·  Each coefficient is translation-invariant: same volatility pattern at any point in time → same feature" />
            </Eq>
            <H3 c="Path-stability score (production output)" />
            <P c="In the production pipeline, the scattering coefficients are distilled into a single path-stability score in [−1,+1]: +1 = smooth, trending path; −1 = erratic, jumpy behavior. The computation now runs as a single 3D tensor batch operation with a cached filter bank and reflection padding — correcting two bugs present in the legacy per-ticker loop implementation." />
            <Insight>The vectorized WST batch eliminates thousands of interpreter round-trips. The two fixed bugs: incorrect boundary conditions (now reflection padding) and an odd-length filter crash — both had silently corrupted historical stability scores.</Insight>
          </Ls>

          <Ls id="l3" n="Layer 3" col="#F59E0B" title="Factor Reliability — IC, ICIR, and signal combination">
            <H3 c="Why Spearman, not Pearson" />
            <P c="A single earnings shock (+30% on one stock, ±2% everywhere else) produces a near-zero Pearson IC even if the factor correctly ranked all other stocks. Spearman rank correlation is Pearson correlation of the rank vectors — a single outlier gets rank N, not a 15σ influence on the correlation." />
            <Eq>
              <div><Val c="IC_t = Spearman(s_t, r_{t+h})" /></div>
              <Cm c="s_t are already rank-transformed → rank(s_t) preserves the same ordering" />
            </Eq>
            <H3 c="ICIR as signal Sharpe ratio" />
            <Eq>
              <div><Val c="ICIR = IC̄ / σ_IC" /></div>
              <div><Sym c="t-stat = ICIR · √T" /></div>
              <Cm c="ICIR 0.3, T=252: t=4.8 (highly significant) · ICIR 0.05: t=0.8 (noise)" />
            </Eq>
            <H3 c="IC-weighted combination" />
            <Eq>
              <div><Val c="Zᵢ = Σ_k w_k · s_{i,k} / Σ_k w_k" /></div>
              <Cm c="w_k = max(ICIR_k, 0)  ·  negative ICIR → zero weight" />
            </Eq>
            <Insight>Regime conditioning: momentum weight → 0 in bear regimes (Barroso & Santa-Clara 2015: momentum crashes occur specifically during market reversals following bear regimes).</Insight>
          </Ls>

          <Ls id="l4a" n="Layer 8" col="#3B82F6" title="Black-Litterman — self-calibrating Bayesian posterior">
            <H3 c="Step 1 — Reverse optimisation" />
            <P c="CAPM says market-cap weights w_mkt are mean-variance optimal. Running the formula backwards gives the implied equilibrium expected returns:" />
            <Eq><div><Val c="μ_eq = λ · Σ · w_mkt" /></div><Cm c="λ = market risk aversion ≈ 2.5" /></Eq>
            <H3 c="Step 2 — Views as active tilts above equilibrium (corrected)" />
            <P c="The legacy implementation set q = Z · scale(μ_eq), which dragged expected-return levels toward zero. The corrected formula treats the composite alpha Z as an active tilt above the equilibrium prior:" />
            <Eq>
              <div><Sym c="P = I_N" /><Sym c="  (absolute views on each stock)" /></div>
              <div><Val c="q = π + Z · scale(μ_eq)" /><Sym c="  (equilibrium prior + active tilt)" /></div>
              <Cm c="π = μ_eq is the CAPM prior. The tilt Z·scale anchors expected-return levels correctly." />
            </Eq>
            <H3 c="Step 3 — Endogenous view uncertainty Ω (the key upgrade)" />
            <P c="In the legacy model, Ω = τ · diag(PΣPᵀ) was a single hand-set constant (He-Litterman uncertainty). Drift 2.0 makes Ω endogenous — computed from the model's own measured IC accuracy and realized view errors:" />
            <Eq>
              <div><Val c="Ω = f(IC_history, realized_errors)" /><Sym c="  (endogenous, per-asset)" /></div>
              <Cm c="Poor recent accuracy → Ω inflates → portfolio drifts toward market baseline. Self-deflating risk gate." />
            </Eq>
            <H3 c="Step 4 — Posterior (conjugate Gaussian update)" />
            <Eq>
              <div><Val c="M = [(τΣ)⁻¹ + PᵀΩ⁻¹P]⁻¹" /><Sym c="  (posterior covariance)" /></div>
              <div><Val c="μ_BL = M · [(τΣ)⁻¹μ_eq + PᵀΩ⁻¹q]" /><Sym c="  (posterior mean)" /></div>
              <Cm c="Precision-weighted average: high-confidence views pull μ_BL toward q; when Ω is large (low confidence), μ_BL stays near μ_eq" />
            </Eq>
          </Ls>

          <Ls id="l4b" n="Layer 10" col="#3B82F6" title="Hierarchical Risk Parity — clustering-based base allocation">
            <H3 c="Step 1 — Distance matrix" />
            <Eq>
              <div><Val c="d_{ij} = √((1 − ρ_{ij}) / 2)" /></div>
              <Cm c="ρ=1→d=0  ·  ρ=0→d=0.707  ·  ρ=−1→d=1  ·  satisfies triangle inequality (unlike d=1−ρ)" />
            </Eq>
            <H3 c="Step 2 — Ward linkage and quasi-diagonalisation" />
            <P c="Ward linkage minimises within-cluster variance at each merge. The dendrogram leaf order (quasi-diagonalisation) reorders the covariance matrix so similar assets are adjacent." />
            <H3 c="Step 3 — Recursive bisection" />
            <Eq>
              <div><Sym c="Var(cluster) = w_c^T Σ w_c" /><Sym c="  (equal weight within cluster)" /></div>
              <div><Val c="α = Var(right) / (Var(left) + Var(right))" /></div>
              <div><Sym c="w_left ← α · w_parent  ·  w_right ← (1−α) · w_parent" /></div>
            </Eq>
            <Note>HRP is the default optimiser — it never fails numerically. BL requires a well-conditioned covariance; HRP works even when T &lt; N.</Note>
          </Ls>

          <Ls id="l4c" n="Layer 14" col="#3B82F6" title="CVaR — the Rockafellar-Uryasev linear programme">
            <H3 c="The non-smooth problem" />
            <Eq><div><Val c="CVaR_α(w) = min_z [ z + 1/((1−α)T) · Σ_t max(−w^T r_t − z, 0) ]" /></div></Eq>
            <P c="The max() makes this non-smooth. Standard gradient methods fail. Rockafellar-Uryasev (2000) showed it reformulates as a linear programme:" />
            <Eq>
              <div><Sym c="min_{w,z,u}  " /><Val c="z + 1/((1−α)T) · Σ_t u_t" /></div>
              <div><Sym c="s.t.  " /><Val c="u_t ≥ −w^T r_t − z" /><Sym c="  ∀ t" /></div>
              <div><Sym c="      " /><Val c="u_t ≥ 0,  Σwᵢ = 1,  0 ≤ wᵢ ≤ max_weight" /></div>
              <Cm c="At optimality: z = VaR_α · objective = CVaR_α · u_t captures loss in excess of VaR" />
            </Eq>
          </Ls>

          <Ls id="l5" n="Layer 9" col="#F59E0B" title="Covariance & Risk Model — Ledoit-Wolf shrinkage and BARRA decomposition">
            <H3 c="Why sample covariance fails" />
            <P c="An N×N covariance matrix has N(N+1)/2 unique parameters. When T approaches N, the condition number (max/min eigenvalue) explodes. Inverting such a matrix amplifies noise by the condition number — 10³ or more for a 100-asset portfolio with 2 years of daily data." />
            <H3 c="Ledoit-Wolf shrinkage" />
            <Eq>
              <div><Val c="Σ̂ = α · F + (1−α) · S" /></div>
              <Cm c="F = (tr(S)/N)·I  (scaled identity target)  ·  α computed analytically from S, no cross-validation" />
            </Eq>
            <H3 c="BARRA decomposition" />
            <Eq>
              <div><Sym c="rᵢ = Σ_k Xᵢ_k · f_k + uᵢ" /></div>
              <div><Val c="Var(r_p) = w^T (X F X^T + Δ) w" /></div>
              <div><Sym c="= w^T X F X^T w  +  w^T Δ w" /></div>
              <Cm c="X = factor exposures (N×K)  ·  F = factor covariance (K×K)  ·  Δ = diagonal specific variance" />
            </Eq>
          </Ls>

          <Ls id="l6" n="Layer 15" col="#00C896" title="Backtest Validation — walk-forward, PSR, and DSR">
            <H3 c="Sharpe ratio variance under non-normality" />
            <Eq>
              <div><Val c="Var(SR̂) ≈ (1/T) · [1 − γ₃ · SR̂ + (γ₄−1)/4 · SR̂²]" /></div>
              <Cm c="γ₃ = skewness  ·  γ₄ = excess kurtosis  ·  negative skew inflates variance → SR̂ less reliable" />
            </Eq>
            <H3 c="Probabilistic Sharpe Ratio" />
            <Eq>
              <div><Val c="PSR(SR*) = Φ( (SR̂ − SR*) · √(T−1) / √(1 − γ₃·SR̂ + (γ₄−1)/4·SR̂²) )" /></div>
              <Cm c="Φ = standard normal CDF  ·  negative skew → larger denominator → lower PSR → correctly penalises tail-risk harvesting" />
            </Eq>
            <H3 c="Deflated Sharpe Ratio" />
            <P c="When N strategies are tested and the best is selected, E[max SR] under the null rises with N. DSR adjusts the benchmark SR* to account for selection bias:" />
            <Eq>
              <div><Val c="SR*_DSR = SR*₀ + σ_{SR̂} · E[max(N)]" /></div>
              <Cm c="E[max(N)] ≈ (1−ρ̄)·Φ⁻¹(1−1/N) + ρ̄·Φ⁻¹(1−1/Ne)  ·  for N=50 independent trials: E[max]≈2.0" />
            </Eq>
            <Insight>PSR(88.6%) means there is an 88.6% probability the true Sharpe exceeds zero — not just that the observed Sharpe is positive. DSR further deducts for how many times you looked before selecting this strategy.</Insight>
          </Ls>

        </main>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between' }}>
        <span className="footer-logo">📡 drift</span>
        <span className="footer-copy"><Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Back to homepage</Link></span>
      </footer>
    </>
  )
}
