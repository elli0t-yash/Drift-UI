'use client'

import { useState } from 'react'

const LAYERS = [
  { n: 'L1',  name: 'Returns',                        files: 'loader.py · cache.py',                       desc: 'Simple and log returns from Zerodha Kite OHLCV. rᵢ,ₜ = Pᵢ,ₜ/Pᵢ,ₜ₋₁ − 1. Forward returns (h=21 days) are computed here for evaluation only — Axiom 2 prohibits them from appearing in any signal path. Strict data contracts enforced throughout.' },
  { n: 'L2',  name: 'Factor Direction & Rank Transform', files: 'factors.py',                              desc: '7 factors (Momentum, Beta, Size, Value, Profitability, Investment, Quality) mapped cross-sectionally to [−1,+1] via sᵢ = (2rᵢ−N−1)/(N−1). Vectorized: the entire panel is computed as a single batched matrix operation — no Python loops.' },
  { n: 'L3',  name: 'Factor Reliability: IC & ICIR',   files: 'ic.py',                                     desc: 'IC_t = Spearman(s_t, r_{t+h}): rank correlation between today\'s factor scores and next-month returns. ICIR = IC̄/σ_IC rewards consistency over average correctness. Negative ICIR → zero weight. Only historically predictive factors are trusted.' },
  { n: 'L4',  name: 'Regime-Aware Factor Weighting',   files: 'regime.py · combiner.py',                  desc: 'HMM market-regime detector augmented with a co-movement graph of ~11 sectors. Six graph features (absorption ratio, Fiedler value, MST length, mean correlation, participation ratio, lead-lag asymmetry) extend the emission space. Factor weights = 0.60·ICIR + 0.40·regime preference. Forward-filtered probabilities enforce zero lookahead.' },
  { n: 'L5',  name: 'Factor Alpha',                    files: 'combiner.py',                               desc: 'Regime-blended weights applied to rank-transformed scores to produce a composite alpha per stock. Stocks are classified into candidate / watchlist / avoid. The precomputed FeatureStore serves this result from memory-mapped Arrow files in <150 ms.' },
  { n: 'L6',  name: 'Wavelet Scattering Stability',    files: 'wst.py',                                    desc: 'Cauchy wavelet scattering applied to log-return paths, distilled into a path-stability score in [−1,+1]: +1 = smooth trend, −1 = erratic/jumpy. Vectorized as a 3D tensor batch with cached filter banks and reflection padding — two bugs from the legacy per-ticker loop corrected.' },
  { n: 'L7',  name: 'Convert Alpha into Return Views', files: 'black_litterman.py',                        desc: 'Composite alpha translated into active return views anchored to equilibrium: q = π + z·scale(μ_eq). The active tilt above the CAPM prior keeps expected-return levels correct — fixing a legacy bug where q was dragged toward zero.' },
  { n: 'L8',  name: 'Black-Litterman Expected Returns', files: 'black_litterman.py',                       desc: 'Bayesian posterior blending CAPM equilibrium with IC-weighted views. The key upgrade: view-uncertainty Ω is endogenous — computed from the model\'s own measured IC accuracy and realized errors. Poor recent accuracy → Ω inflates → portfolio drifts toward market baseline automatically.' },
  { n: 'L9',  name: 'Covariance & Risk Model',         files: 'covariance.py · factor_model.py',           desc: 'Ledoit-Wolf analytical shrinkage (Σ̂ = α·F+(1−α)·S) for a well-conditioned covariance matrix. EWMA for recency. BARRA factor decomposition: Var(rₚ) = wᵀ(XFXᵀ+Δ)w — separates systematic from specific risk.' },
  { n: 'L10', name: 'Base Allocation & Alpha Tilt',    files: 'hrp.py · black_litterman.py · cvar.py',     desc: 'HRP-style risk-aware base (Ward linkage + recursive bisection, no matrix inversion) alpha-tilted with the Black-Litterman posterior. Three parallel outputs: BL / HRP / CVaR weights. All long-only, sum-to-one.' },
  { n: 'L11', name: 'Portfolio Expected Return',        files: 'metrics.py',                                desc: 'E[rₚ] = wᵀμ_BL. Per-asset return contributions computed from posterior means. Every number is fully traceable back through the pipeline to raw prices.' },
  { n: 'L12', name: 'Portfolio Risk & Sharpe Ratio',   files: 'metrics.py · covariance.py',               desc: 'σₚ = √(wᵀΣw). Ex-ante Sharpe = (E[rₚ]−rf)/σₚ. Full factor vs. specific risk split from BARRA decomposition. Per-stock and per-factor risk attribution.' },
  { n: 'L13', name: 'Turnover & Transaction Cost',     files: 'costs.py',                                  desc: 'One-way turnover = ½·Σᵢ|wᵢ,t−wᵢ,t₋₁|. Transaction cost drag = turnover × cost_bps. Net-of-cost expected return reported. Rebalancing frequency and cost assumptions are configurable.' },
  { n: 'L14', name: 'Scenario Risk & CVaR',            files: 'stress.py · cvar.py',                       desc: 'Rockafellar-Uryasev CVaR linear programme at α=0.95. Historical stress scenarios: GFC 2008, COVID crash 2020, rate shock 2022, Russia-Ukraine 2022. Per-scenario P&L and worst-case contribution by asset.' },
  { n: 'L15', name: 'Backtest Validation',             files: 'engine.py · metrics.py',                    desc: 'Walk-forward backtest with expanding window. Probabilistic Sharpe Ratio (PSR) corrects for non-normality of returns. Deflated Sharpe Ratio (DSR) adjusts for multiple-testing bias. Lookahead enforced by a CI property test — future data must never change earlier regime probabilities.' },
]

function LayerGraphic({ layer }: { layer: string }) {
  const common = {
    viewBox: '0 0 360 190',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': `${layer} Drift pipeline schematic`,
  }

  if (layer === 'L1') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">MARKET DATA</text>
      <rect className="lg-box" x="18" y="34" width="86" height="30" rx="4" /><text className="lg-text" x="61" y="53">Zerodha Kite</text>
      <rect className="lg-box" x="18" y="76" width="86" height="30" rx="4" /><text className="lg-text" x="61" y="95">OHLCV</text>
      <rect className="lg-box" x="18" y="118" width="86" height="30" rx="4" /><text className="lg-text" x="61" y="137">Fundamentals</text>
      <path className="lg-flow" d="M104 49h26v50h28M104 91h54M104 133h26V99" />
      <rect className="lg-accent-box" x="158" y="76" width="82" height="46" rx="5" />
      <text className="lg-strong" x="199" y="96">async engine</text><text className="lg-text" x="199" y="111">rate-limited</text>
      <path className="lg-flow" d="M240 99h22" />
      <path className="lg-accent" d="M262 78c0-7 17-12 38-12s38 5 38 12v45c0 7-17 12-38 12s-38-5-38-12zM262 78c0 7 17 12 38 12s38-5 38-12M262 100c0 7 17 12 38 12s38-5 38-12" />
      <text className="lg-strong" x="300" y="154">FeatureStore</text><text className="lg-caption" x="262" y="170">(date, ticker)</text>
    </svg>
  )

  if (layer === 'L2') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">7 FACTORS — RANK TRANSFORM</text>
      <rect className="lg-box" x="16" y="76" width="70" height="40" rx="4" /><text className="lg-strong" x="51" y="94">returns</text><text className="lg-text" x="51" y="108">OHLCV</text>
      <path className="lg-flow" d="M86 96h28" />
      <rect className="lg-accent-box" x="114" y="50" width="136" height="90" rx="5" />
      <text className="lg-strong" x="182" y="73">rank transform</text>
      <text className="lg-text" x="182" y="90">sᵢ = (2rᵢ−N−1)/(N−1)</text>
      <text className="lg-formula" x="182" y="110">vectorized matrix op</text>
      <text className="lg-text" x="182" y="130">7 factors → [−1, +1]</text>
      <path className="lg-flow" d="M250 96h30" />
      <rect className="lg-box" x="280" y="60" width="64" height="68" rx="4" /><text className="lg-strong" x="312" y="85">s_i,k</text><text className="lg-text" x="312" y="102">scores</text>
    </svg>
  )

  if (layer === 'L3') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">FACTOR RELIABILITY</text>
      {['momentum','value','quality','size'].map((name, i) => <g key={name}><rect className="lg-box" x="18" y={34 + i * 34} width="88" height="24" rx="3" /><text className="lg-text" x="62" y={50 + i * 34}>{name}</text><path className="lg-flow" d={`M106 ${46 + i * 34}h36`} /></g>)}
      <rect className="lg-accent-box" x="142" y="52" width="94" height="82" rx="5" /><text className="lg-strong" x="189" y="73">IC / ICIR</text><text className="lg-text" x="189" y="91">Spearman</text><text className="lg-formula" x="189" y="113">w = max(ICIR, 0)</text>
      <path className="lg-flow" d="M236 93h30" />
      <rect className="lg-box" x="266" y="50" width="78" height="86" rx="5" /><text className="lg-strong" x="305" y="72">factor</text><text className="lg-text" x="305" y="89">weights</text>
      <path className="lg-accent" d="M279 119l10-16 10 7 10-28 10 14 12-23" />
      <text className="lg-caption" x="266" y="153">ICIR RANKED</text>
    </svg>
  )

  if (layer === 'L4') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">HMM + CO-MOVEMENT GRAPH</text>
      <rect className="lg-box" x="14" y="42" width="90" height="34" rx="4" /><text className="lg-strong" x="59" y="57">HMM regimes</text><text className="lg-text" x="59" y="70">bull · bear · flat</text>
      <rect className="lg-box" x="14" y="98" width="90" height="56" rx="4" />
      <text className="lg-strong" x="59" y="115">co-movement</text>
      <text className="lg-text" x="59" y="130">absorption ratio</text>
      <text className="lg-text" x="59" y="143">Fiedler · MST</text>
      <path className="lg-flow" d="M104 59h32v42h18M104 126h50" />
      <rect className="lg-accent-box" x="154" y="72" width="110" height="44" rx="5" /><text className="lg-strong" x="209" y="90">filtered probs</text><text className="lg-text" x="209" y="106">point-in-time</text>
      <path className="lg-flow" d="M264 94h22" />
      <rect className="lg-box" x="286" y="56" width="62" height="76" rx="4" /><text className="lg-strong" x="317" y="80">w_f,t</text><text className="lg-formula" x="317" y="100">0.60·ICIR</text><text className="lg-formula" x="317" y="116">+0.40·reg</text>
    </svg>
  )

  if (layer === 'L5') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">COMPOSITE ALPHA → SCREENER</text>
      <rect className="lg-box" x="16" y="76" width="80" height="40" rx="4" /><text className="lg-strong" x="56" y="94">w_f,t</text><text className="lg-text" x="56" y="108">blended wts</text>
      <path className="lg-flow" d="M96 96h34" />
      <rect className="lg-accent-box" x="130" y="56" width="110" height="80" rx="5" />
      <text className="lg-strong" x="185" y="79">factor alpha</text>
      <text className="lg-text" x="185" y="96">α = Σ w_k · s_k</text>
      <text className="lg-formula" x="185" y="115">candidate / watch</text>
      <text className="lg-formula" x="185" y="128">/ avoid</text>
      <path className="lg-flow" d="M240 96h28" />
      <rect className="lg-box" x="268" y="60" width="76" height="72" rx="4" />
      <text className="lg-strong" x="306" y="82">screener</text>
      <text className="lg-text" x="306" y="98">&lt;150 ms</text>
      <text className="lg-text" x="306" y="114">mmap Arrow</text>
    </svg>
  )

  if (layer === 'L6') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">WAVELET SCATTERING STABILITY</text>
      <rect className="lg-box" x="16" y="76" width="76" height="40" rx="4" /><text className="lg-strong" x="54" y="94">log-returns</text><text className="lg-text" x="54" y="108">path</text>
      <path className="lg-flow" d="M92 96h30" />
      <rect className="lg-accent-box" x="122" y="54" width="130" height="84" rx="5" />
      <text className="lg-strong" x="187" y="76">Cauchy WST</text>
      <text className="lg-text" x="187" y="93">3D tensor batch</text>
      <text className="lg-formula" x="187" y="110">cached filter bank</text>
      <text className="lg-text" x="187" y="127">vectorized</text>
      <path className="lg-flow" d="M252 96h28" />
      <rect className="lg-box" x="280" y="58" width="66" height="76" rx="4" />
      <text className="lg-strong" x="313" y="82">stability</text>
      <text className="lg-formula" x="313" y="100">[−1, +1]</text>
      <text className="lg-text" x="313" y="118">smooth/jumpy</text>
    </svg>
  )

  if (layer === 'L7') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">ALPHA → RETURN VIEWS</text>
      <rect className="lg-box" x="14" y="60" width="84" height="70" rx="4" />
      <text className="lg-strong" x="56" y="82">composite α</text>
      <text className="lg-text" x="56" y="98">stability score</text>
      <text className="lg-text" x="56" y="114">regime wts</text>
      <path className="lg-flow" d="M98 95h34" />
      <rect className="lg-accent-box" x="132" y="56" width="128" height="80" rx="5" />
      <text className="lg-strong" x="196" y="80">active tilt</text>
      <text className="lg-formula" x="196" y="98">q = π + z·scale(μ_eq)</text>
      <text className="lg-text" x="196" y="116">anchored to CAPM prior</text>
      <path className="lg-flow" d="M260 96h26" />
      <rect className="lg-box" x="286" y="62" width="62" height="68" rx="4" />
      <text className="lg-strong" x="317" y="86">views q</text>
      <text className="lg-text" x="317" y="104">per asset</text>
    </svg>
  )

  if (layer === 'L8') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">SELF-CALIBRATING BLACK-LITTERMAN</text>
      <rect className="lg-box" x="14" y="58" width="84" height="72" rx="4" />
      <text className="lg-strong" x="56" y="80">views q</text>
      <text className="lg-text" x="56" y="96">μ_eq (CAPM)</text>
      <text className="lg-text" x="56" y="112">Σ covariance</text>
      <path className="lg-flow" d="M98 94h28" />
      <rect className="lg-accent-box" x="126" y="48" width="132" height="96" rx="5" />
      <text className="lg-strong" x="192" y="72">BL posterior</text>
      <text className="lg-formula" x="192" y="90">Ω = f(IC, errors)</text>
      <text className="lg-text" x="192" y="107">endogenous</text>
      <text className="lg-formula" x="192" y="124">auto risk gate</text>
      <path className="lg-flow" d="M258 96h26" />
      <rect className="lg-box" x="284" y="62" width="64" height="68" rx="4" />
      <text className="lg-strong" x="316" y="86">μ_BL</text>
      <text className="lg-text" x="316" y="104">posterior</text>
    </svg>
  )

  if (layer === 'L9') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">COVARIANCE &amp; RISK MODEL</text>
      <rect className="lg-box" x="14" y="38" width="108" height="46" rx="4" /><text className="lg-strong" x="68" y="57">Ledoit-Wolf</text><text className="lg-text" x="68" y="72">shrink covariance</text>
      <rect className="lg-box" x="14" y="104" width="108" height="46" rx="4" /><text className="lg-strong" x="68" y="123">BARRA</text><text className="lg-text" x="68" y="138">XFXᵀ + Δ</text>
      <path className="lg-flow" d="M122 61h34v34h18M122 127h34V95" />
      <circle className="lg-accent-box" cx="215" cy="95" r="41" /><text className="lg-strong" x="215" y="88">Σ̂</text><text className="lg-formula" x="215" y="106">shrunk</text>
      <path className="lg-flow" d="M256 95h26" />
      <rect className="lg-box" x="282" y="50" width="66" height="90" rx="4" /><text className="lg-strong" x="315" y="74">risk</text><text className="lg-text" x="315" y="91">factor</text><text className="lg-text" x="315" y="107">specific</text><text className="lg-text" x="315" y="123">EWMA</text>
    </svg>
  )

  if (layer === 'L10') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">BASE ALLOCATION + ALPHA TILT</text>
      <rect className="lg-box" x="14" y="72" width="80" height="44" rx="4" /><text className="lg-strong" x="54" y="91">μ_BL + Σ</text><text className="lg-text" x="54" y="106">alpha + risk</text>
      <path className="lg-flow" d="M94 94h28M122 94V38h24M122 94h24M122 94v56h24" />
      <rect className="lg-accent-box" x="146" y="18" width="104" height="40" rx="4" /><text className="lg-strong" x="198" y="36">Black-Litterman</text><text className="lg-text" x="198" y="50">alpha tilt</text>
      <rect className="lg-accent-box" x="146" y="74" width="104" height="40" rx="4" /><text className="lg-strong" x="198" y="92">HRP</text><text className="lg-text" x="198" y="106">risk-aware base</text>
      <rect className="lg-accent-box" x="146" y="130" width="104" height="40" rx="4" /><text className="lg-strong" x="198" y="148">CVaR</text><text className="lg-text" x="198" y="162">tail-optimal</text>
      <path className="lg-flow" d="M250 38h26v56h18M250 94h44M250 150h26V94" />
      <rect className="lg-box" x="294" y="60" width="52" height="68" rx="4" /><text className="lg-strong" x="320" y="79">w*</text>
      <path className="lg-accent" d="M305 115V99M315 115V88M325 115V104M335 115V82" />
    </svg>
  )

  if (layer === 'L11') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">PORTFOLIO EXPECTED RETURN</text>
      <rect className="lg-box" x="14" y="72" width="80" height="44" rx="4" /><text className="lg-strong" x="54" y="91">w* · μ_BL</text><text className="lg-text" x="54" y="106">weights × views</text>
      <path className="lg-flow" d="M94 94h40" />
      <rect className="lg-accent-box" x="134" y="54" width="130" height="82" rx="5" />
      <text className="lg-strong" x="199" y="80">E[rₚ] = wᵀμ_BL</text>
      <text className="lg-text" x="199" y="98">per-asset contrib</text>
      <text className="lg-formula" x="199" y="116">fully traceable</text>
      <path className="lg-flow" d="M264 95h26" />
      <rect className="lg-box" x="290" y="62" width="58" height="68" rx="4" /><text className="lg-strong" x="319" y="87">E[r]</text><text className="lg-text" x="319" y="105">report</text>
    </svg>
  )

  if (layer === 'L12') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">PORTFOLIO RISK &amp; SHARPE</text>
      <rect className="lg-box" x="14" y="38" width="104" height="46" rx="4" /><text className="lg-strong" x="66" y="57">σₚ = √(wᵀΣw)</text><text className="lg-text" x="66" y="72">portfolio vol</text>
      <rect className="lg-box" x="14" y="104" width="104" height="46" rx="4" /><text className="lg-strong" x="66" y="123">BARRA split</text><text className="lg-text" x="66" y="138">factor vs specific</text>
      <path className="lg-flow" d="M118 61h34v34h18M118 127h34V95" />
      <circle className="lg-accent-box" cx="211" cy="95" r="41" /><text className="lg-strong" x="211" y="88">Sharpe</text><text className="lg-formula" x="211" y="106">(E[r]−rf)/σ</text>
      <path className="lg-flow" d="M252 95h26" />
      <rect className="lg-box" x="278" y="50" width="70" height="90" rx="4" /><text className="lg-strong" x="313" y="74">risk</text><text className="lg-text" x="313" y="91">attrib</text><text className="lg-text" x="313" y="108">per stock</text><text className="lg-text" x="313" y="124">per factor</text>
    </svg>
  )

  if (layer === 'L13') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">TURNOVER &amp; TRANSACTION COST</text>
      <rect className="lg-box" x="14" y="58" width="90" height="72" rx="4" />
      <text className="lg-strong" x="59" y="80">w_t vs w_{"{t-1}"}</text>
      <text className="lg-text" x="59" y="97">rebalance delta</text>
      <text className="lg-text" x="59" y="114">configurable bps</text>
      <path className="lg-flow" d="M104 94h36" />
      <rect className="lg-accent-box" x="140" y="52" width="130" height="88" rx="5" />
      <text className="lg-strong" x="205" y="76">turnover</text>
      <text className="lg-formula" x="205" y="94">½·Σ|wᵢ,t−wᵢ,t₋₁|</text>
      <text className="lg-text" x="205" y="112">cost drag</text>
      <text className="lg-formula" x="205" y="128">turnover × bps</text>
      <path className="lg-flow" d="M270 96h22" />
      <rect className="lg-box" x="292" y="62" width="58" height="68" rx="4" /><text className="lg-strong" x="321" y="86">net r</text><text className="lg-text" x="321" y="104">after costs</text>
    </svg>
  )

  if (layer === 'L14') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">SCENARIO RISK &amp; CVaR</text>
      <rect className="lg-box" x="14" y="38" width="104" height="46" rx="4" /><text className="lg-strong" x="66" y="57">CVaR α=0.95</text><text className="lg-text" x="66" y="72">Rockafellar-Uryasev</text>
      <rect className="lg-box" x="14" y="104" width="104" height="46" rx="4" /><text className="lg-strong" x="66" y="123">stress scenarios</text><text className="lg-text" x="66" y="138">4 historical events</text>
      <path className="lg-flow" d="M118 61h34v34h18M118 127h34V95" />
      <circle className="lg-accent-box" cx="211" cy="95" r="41" /><text className="lg-strong" x="211" y="88">tail</text><text className="lg-formula" x="211" y="106">risk</text>
      <path className="lg-flow" d="M252 95h26" />
      <rect className="lg-box" x="278" y="38" width="70" height="112" rx="4" /><text className="lg-strong" x="313" y="57">P&amp;L</text><text className="lg-text" x="313" y="78">GFC</text><text className="lg-text" x="313" y="96">COVID</text><text className="lg-text" x="313" y="114">rates</text><text className="lg-text" x="313" y="132">war</text>
    </svg>
  )

  if (layer === 'L15') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">WALK-FORWARD BACKTEST</text>
      <path className="lg-line" d="M20 128h320M30 48v80M90 48v80M150 48v80M210 48v80M270 48v80M330 48v80" />
      <path className="lg-accent" d="M30 111l60-14 60 8 60-34 60 15 60-47" />
      <path className="lg-flow" d="M62 145h52M122 145h52M182 145h52M242 145h52" />
      <text className="lg-text" x="30" y="163">train</text><text className="lg-text" x="90" y="163">trade</text><text className="lg-text" x="150" y="163">expand</text><text className="lg-text" x="210" y="163">trade</text><text className="lg-strong" x="284" y="163">PSR / DSR</text>
      <circle className="lg-node" cx="330" cy="39" r="6" />
    </svg>
  )

  return (
    <svg {...common}>
      <rect className="lg-accent-box" x="18" y="48" width="88" height="94" rx="5" /><text className="lg-strong" x="62" y="68">Drift core</text><text className="lg-text" x="62" y="88">signals</text><text className="lg-text" x="62" y="106">weights</text><text className="lg-text" x="62" y="124">metrics</text>
      <path className="lg-flow" d="M106 95h42M148 95V42h32M148 95h32M148 95v53h32" />
      <rect className="lg-box" x="180" y="22" width="84" height="40" rx="4" /><text className="lg-strong" x="222" y="40">Streamlit</text><text className="lg-text" x="222" y="53">research UI</text>
      <rect className="lg-box" x="180" y="75" width="84" height="40" rx="4" /><text className="lg-strong" x="222" y="93">FastAPI</text><text className="lg-text" x="222" y="106">endpoints</text>
      <rect className="lg-box" x="180" y="128" width="84" height="40" rx="4" /><text className="lg-strong" x="222" y="146">MCP server</text><text className="lg-text" x="222" y="159">agent tools</text>
      <path className="lg-flow" d="M264 42h40M264 95h40M264 148h40" />
      <circle className="lg-node" cx="318" cy="42" r="12" /><circle className="lg-node" cx="318" cy="95" r="12" /><circle className="lg-node" cx="318" cy="148" r="12" />
    </svg>
  )
}

export function Layers() {
  const [active, setActive] = useState(0)
  const layer = LAYERS[active]

  const selectLayer = (index: number) => {
    setActive((index + LAYERS.length) % LAYERS.length)
  }

  return (
    <section id="layers" className="section">
      <div className="sec-label">architecture</div>
      <h2 className="sec-h2">Fifteen layers, one pipeline</h2>
      <p className="sec-sub">Follow data from raw prices to validated portfolio weights. Select any stage to inspect its role in the system.</p>

      <div className="pipeline-shell">
        <div className="pipeline-flow" aria-label="Drift architecture pipeline">
          {LAYERS.map((l, index) => (
            <button
              type="button"
              key={l.n}
              className={`pipeline-stage${active === index ? ' active' : ''}${active > index ? ' complete' : ''}`}
              onClick={() => selectLayer(index)}
              aria-pressed={active === index}
            >
              <span className="pipeline-node">
                <span>{l.n}</span>
              </span>
              <span className="pipeline-stage-name">{l.name}</span>
              {index < LAYERS.length - 1 && <span className="pipeline-connector" aria-hidden="true" />}
            </button>
          ))}
        </div>

        <div className="pipeline-detail" key={layer.n}>
          <div className="pipeline-copy">
            <div className="pipeline-detail-top">
              <span className="pipeline-kicker">{layer.n} of {LAYERS.length} · <strong>{layer.name}</strong></span>
              <span className="pipeline-status">active</span>
            </div>
            <div className="pipeline-segments" aria-label={`Layer ${active + 1} of ${LAYERS.length}`}>
              {LAYERS.map((item, index) => (
                <span key={item.n} className={`pipeline-segment${active === index ? ' active' : ''}`} />
              ))}
            </div>
            <h3>{layer.name}</h3>
            <p>{layer.desc}</p>
            <div className="pipeline-files">
              <span>modules</span>
              <code>{layer.files}</code>
            </div>
            <div className="pipeline-controls">
              <button type="button" onClick={() => selectLayer(active - 1)}>← Previous layer</button>
              <button type="button" onClick={() => selectLayer(active + 1)}>Next layer →</button>
            </div>
          </div>

          <div className="pipeline-visual">
            <div className="pipeline-visual-label">
              <span>{layer.n}</span>
              live system view
            </div>
            <LayerGraphic layer={layer.n} />
          </div>
        </div>
      </div>
    </section>
  )
}
