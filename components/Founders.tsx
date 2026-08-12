const FOUNDERS = [
  {
    initial:  'Y',
    avatarCls: 'avatar avatar-y',
    name:   'Yash Mishra',
    role:   'SYSTEMS · OPTIMAL TRANSPORT',
    org:    'Senior Software Engineer, Bajaj Finance Ltd',
    bio:    'Concurrent systems, optimal transport, and real-time indexing. Built the Rust orchestration layer for OmniPulse (HNSW + Sliced Wasserstein) and the full fifteen-layer Drift platform — from data ingestion through the Streamlit dashboard.',
    links:  [
      { label: 'LinkedIn ↗', href: 'https://www.linkedin.com/in/mishra-yash2002/' },
      { label: 'GitHub ↗',   href: 'https://github.com/elli0t-yash' },
      { label: 'yash01012002@gmail.com', href: 'mailto:yash01012002@gmail.com' },
    ],
    pills: [
      { label: 'vector-index',       href: 'https://crates.io/crates/vector-index',       cls: 'cpill' },
      { label: 'sliced-wasserstein', href: 'https://crates.io/crates/sliced-wasserstein', cls: 'cpill' },
      { label: 'drift-quant',        href: 'https://pypi.org/project/drift-quant/',       cls: 'cpill' },
    ],
  },
  {
    initial:  'S',
    avatarCls: 'avatar avatar-s',
    name:   'Samvardhan Singh',
    role:   'APPLIED AI · MLOPS',
    org:    'Automation Engineering & AI/MLOps, NielsenIQ',
    bio:    'Automation engineering, AI/MLOps pipelines, and C++/CUDA DSP kernels. Architect of omni-wst-core — the scattering engine Drift\'s WST layer calls via PyO3 — and the Python agentic control plane for OmniPulse.',
    links:  [
      { label: 'samvardhan.vercel.app ↗', href: 'https://samvardhan.vercel.app/' },
      { label: 'GitHub ↗',               href: 'https://github.com/samvardhan03' },
      { label: 'shekhawatsamvardhan@gmail.com', href: 'mailto:shekhawatsamvardhan@gmail.com' },
    ],
    pills: [
      { label: 'omni-wst-core',   href: 'https://pypi.org/project/omni-wst-core/',  cls: 'cpill cpill-indigo' },
      { label: 'omni-ffi',        href: 'https://crates.io/crates/omni-ffi',         cls: 'cpill cpill-indigo' },
      { label: 'omnipulse-agent', href: 'https://pypi.org/project/omnipulse-agent/', cls: 'cpill cpill-indigo' },
    ],
  },
]

export function Founders() {
  return (
    <section id="founders" className="section">
      <div className="sec-label">the people behind drift</div>
      <h2 className="sec-h2">Founders</h2>
      <p className="sec-sub">
        Drift applies the same mathematical foundations as OmniPulse — scattering
        transforms and optimal transport — to quantitative finance.
      </p>

      <div className="founders-grid">
        {FOUNDERS.map(f => (
          <div key={f.name} className="founder-card">
            <div className="f-top">
              <div className={f.avatarCls}>{f.initial}</div>
              <div>
                <div className="f-name">{f.name}</div>
                <div className="f-role">{f.role}</div>
                <div className="f-org">{f.org}</div>
              </div>
            </div>

            <p className="f-bio">{f.bio}</p>

            <div className="f-links">
              {f.links.map(l => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="f-link">
                  {l.label}
                </a>
              ))}
            </div>

            <div className="maint">
              <div className="maint-lbl">maintains</div>
              {f.pills.map(p => (
                <a key={p.href} href={p.href} target="_blank" rel="noreferrer" className={p.cls}>
                  {p.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
