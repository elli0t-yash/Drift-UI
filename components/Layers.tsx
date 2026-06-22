'use client'

import { useState } from 'react'

const LAYERS = [
  { n: 'L1', name: 'Data',                  files: 'cache.py · loader.py',                  desc: 'Provider-agnostic DataLoader backed by a Parquet cache at ~/.drift/cache. Lazy OpenBB import — swap yfinance for Polygon or Refinitiv in one line. Returns a clean (date, ticker) MultiIndex DataFrame every layer above depends on.' },
  { n: 'L2', name: 'Feature engineering',   files: 'factors.py · regime.py · wst.py',       desc: 'Three parallel tracks: Factor engine (7 rank-transformed signals using s = (2r−N−1)/(N−1)), HMM regime detector (Baum-Welch + Viterbi + StandardScaler to prevent covariance collapse), WST extractor (37-dim Cauchy scattering coefficients from log-returns).' },
  { n: 'L3', name: 'Alpha engine',           files: 'ic.py · combiner.py',                   desc: 'IC_t = Spearman(s_t, r_{t+h}). ICIR = IC̄ / σ_IC. Negative ICIR → zero weight. Regime gating: momentum suppressed in bear regimes by default (Barroso & Santa-Clara 2015).' },
  { n: 'L4', name: 'Portfolio construction', files: 'black_litterman.py · hrp.py · cvar.py', desc: 'Three optimisers on the same covariance estimate. Black-Litterman: Bayesian posterior blending CAPM equilibrium with IC-weighted views. HRP: Ward linkage + recursive bisection, no matrix inversion. CVaR: Rockafellar-Uryasev linear programme at α=0.95.' },
  { n: 'L5', name: 'Risk model',             files: 'covariance.py · factor_model.py · stress.py', desc: 'Ledoit-Wolf analytical shrinkage (Oracle Approximating Shrinkage). BARRA decomposition: Var(rₚ) = wᵀ(XFXᵀ+Δ)w. Stress scenarios: GFC (2008), COVID crash (2020), rate shock (2022), Russia-Ukraine (2022).' },
  { n: 'L6', name: 'Backtest engine',        files: 'engine.py · metrics.py · costs.py',     desc: 'Event-driven walk-forward with expanding window. PSR: Φ((SR̂−SR*)√(T−1) / √(1−γ₃SR̂+(γ₄−1)/4·SR̂²)) — corrects for non-normality of returns. DSR adjusts for multiple-testing bias.' },
  { n: 'L7', name: 'Dashboard / API',        files: 'app.py · main.py · mcp_server.py',      desc: 'Streamlit research dashboard with four pages. FastAPI server with 7 endpoints and async backtest queue. MCP server exposable to Claude Desktop and Codex CLI.' },
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
      <text className="lg-caption" x="18" y="20">MARKET PROVIDERS</text>
      <rect className="lg-box" x="18" y="34" width="78" height="30" rx="4" /><text className="lg-text" x="57" y="53">OpenBB</text>
      <rect className="lg-box" x="18" y="76" width="78" height="30" rx="4" /><text className="lg-text" x="57" y="95">Polygon</text>
      <rect className="lg-box" x="18" y="118" width="78" height="30" rx="4" /><text className="lg-text" x="57" y="137">Refinitiv</text>
      <path className="lg-flow" d="M96 49h32v50h28M96 91h60M96 133h32V99" />
      <rect className="lg-accent-box" x="156" y="76" width="82" height="46" rx="5" />
      <text className="lg-strong" x="197" y="96">DataLoader</text><text className="lg-text" x="197" y="111">normalize</text>
      <path className="lg-flow" d="M238 99h26" />
      <path className="lg-accent" d="M264 78c0-7 17-12 38-12s38 5 38 12v45c0 7-17 12-38 12s-38-5-38-12zM264 78c0 7 17 12 38 12s38-5 38-12M264 100c0 7 17 12 38 12s38-5 38-12" />
      <text className="lg-strong" x="302" y="154">Parquet cache</text><text className="lg-caption" x="264" y="170">(date, ticker)</text>
    </svg>
  )

  if (layer === 'L2') return (
    <svg {...common}>
      <rect className="lg-box" x="16" y="76" width="70" height="40" rx="4" /><text className="lg-strong" x="51" y="94">returns</text><text className="lg-text" x="51" y="108">OHLCV</text>
      <path className="lg-flow" d="M86 96h28M114 96V38h24M114 96h24M114 96v58h24" />
      <rect className="lg-accent-box" x="138" y="18" width="116" height="42" rx="4" /><text className="lg-strong" x="196" y="36">7 factors</text><text className="lg-text" x="196" y="51">rank transform</text>
      <rect className="lg-accent-box" x="138" y="75" width="116" height="42" rx="4" /><text className="lg-strong" x="196" y="93">HMM regimes</text><text className="lg-text" x="196" y="108">bull · bear · flat</text>
      <rect className="lg-accent-box" x="138" y="132" width="116" height="42" rx="4" /><text className="lg-strong" x="196" y="150">Cauchy WST</text><text className="lg-text" x="196" y="165">37 coefficients</text>
      <path className="lg-flow" d="M254 39h32v57h18M254 96h50M254 153h32V96" />
      <rect className="lg-box" x="304" y="73" width="42" height="46" rx="4" /><text className="lg-strong" x="325" y="93">X</text><text className="lg-text" x="325" y="107">features</text>
    </svg>
  )

  if (layer === 'L3') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">CROSS-SECTIONAL SIGNALS</text>
      {['momentum','value','quality','size'].map((name, i) => <g key={name}><rect className="lg-box" x="18" y={34 + i * 34} width="88" height="24" rx="3" /><text className="lg-text" x="62" y={50 + i * 34}>{name}</text><path className="lg-flow" d={`M106 ${46 + i * 34}h36`} /></g>)}
      <rect className="lg-accent-box" x="142" y="52" width="94" height="82" rx="5" /><text className="lg-strong" x="189" y="73">IC / ICIR</text><text className="lg-text" x="189" y="91">Spearman</text><text className="lg-formula" x="189" y="113">w = max(ICIR, 0)</text>
      <path className="lg-flow" d="M236 93h30" />
      <rect className="lg-box" x="266" y="50" width="78" height="86" rx="5" /><text className="lg-strong" x="305" y="72">alpha</text><text className="lg-text" x="305" y="89">regime gated</text>
      <path className="lg-accent" d="M279 119l10-16 10 7 10-28 10 14 12-23" />
      <text className="lg-caption" x="266" y="153">COMPOSITE Z</text>
    </svg>
  )

  if (layer === 'L4') return (
    <svg {...common}>
      <rect className="lg-box" x="18" y="72" width="76" height="44" rx="4" /><text className="lg-strong" x="56" y="91">α + Σ</text><text className="lg-text" x="56" y="106">views + risk</text>
      <path className="lg-flow" d="M94 94h28M122 94V38h24M122 94h24M122 94v56h24" />
      <rect className="lg-accent-box" x="146" y="18" width="100" height="40" rx="4" /><text className="lg-strong" x="196" y="36">Black-Litterman</text><text className="lg-text" x="196" y="50">Bayesian views</text>
      <rect className="lg-accent-box" x="146" y="74" width="100" height="40" rx="4" /><text className="lg-strong" x="196" y="92">HRP</text><text className="lg-text" x="196" y="106">cluster risk</text>
      <rect className="lg-accent-box" x="146" y="130" width="100" height="40" rx="4" /><text className="lg-strong" x="196" y="148">CVaR</text><text className="lg-text" x="196" y="162">tail loss</text>
      <path className="lg-flow" d="M246 38h26v56h20M246 94h46M246 150h26V94" />
      <rect className="lg-box" x="292" y="60" width="52" height="68" rx="4" /><text className="lg-strong" x="318" y="79">w*</text>
      <path className="lg-accent" d="M303 115V99M313 115V88M323 115V104M333 115V82" />
    </svg>
  )

  if (layer === 'L5') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">PORTFOLIO RISK CONTROL</text>
      <rect className="lg-box" x="18" y="38" width="100" height="46" rx="4" /><text className="lg-strong" x="68" y="57">Ledoit-Wolf</text><text className="lg-text" x="68" y="72">shrink covariance</text>
      <rect className="lg-box" x="18" y="104" width="100" height="46" rx="4" /><text className="lg-strong" x="68" y="123">BARRA</text><text className="lg-text" x="68" y="138">XFXᵀ + Δ</text>
      <path className="lg-flow" d="M118 61h34v34h20M118 127h34V95" />
      <circle className="lg-accent-box" cx="213" cy="95" r="41" /><text className="lg-strong" x="213" y="88">risk</text><text className="lg-formula" x="213" y="106">wᵀΣw</text>
      <path className="lg-flow" d="M254 95h28" />
      <rect className="lg-box" x="282" y="38" width="64" height="112" rx="4" /><text className="lg-strong" x="314" y="57">stress</text><text className="lg-text" x="314" y="78">GFC</text><text className="lg-text" x="314" y="96">COVID</text><text className="lg-text" x="314" y="114">rates</text><text className="lg-text" x="314" y="132">war</text>
    </svg>
  )

  if (layer === 'L6') return (
    <svg {...common}>
      <text className="lg-caption" x="18" y="20">WALK-FORWARD SIMULATION</text>
      <path className="lg-line" d="M20 128h320M30 48v80M90 48v80M150 48v80M210 48v80M270 48v80M330 48v80" />
      <path className="lg-accent" d="M30 111l60-14 60 8 60-34 60 15 60-47" />
      <path className="lg-flow" d="M62 145h52M122 145h52M182 145h52M242 145h52" />
      <text className="lg-text" x="30" y="163">train</text><text className="lg-text" x="90" y="163">trade</text><text className="lg-text" x="150" y="163">expand</text><text className="lg-text" x="210" y="163">trade</text><text className="lg-strong" x="300" y="163">PSR 88.6%</text>
      <circle className="lg-node" cx="330" cy="39" r="6" />
    </svg>
  )

  return (
    <svg {...common}>
      <rect className="lg-accent-box" x="18" y="48" width="88" height="94" rx="5" /><text className="lg-strong" x="62" y="68">Drift core</text><text className="lg-text" x="62" y="88">signals</text><text className="lg-text" x="62" y="106">weights</text><text className="lg-text" x="62" y="124">metrics</text>
      <path className="lg-flow" d="M106 95h42M148 95V42h32M148 95h32M148 95v53h32" />
      <rect className="lg-box" x="180" y="22" width="84" height="40" rx="4" /><text className="lg-strong" x="222" y="40">Streamlit</text><text className="lg-text" x="222" y="53">research UI</text>
      <rect className="lg-box" x="180" y="75" width="84" height="40" rx="4" /><text className="lg-strong" x="222" y="93">FastAPI</text><text className="lg-text" x="222" y="106">7 endpoints</text>
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
      <h2 className="sec-h2">Seven layers, one pipeline</h2>
      <p className="sec-sub">Follow data from ingestion to delivery. Select any stage to inspect its role in the system.</p>

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
