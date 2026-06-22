const SIGNALS = [
  { t: 'AAPL',         f: 'momentum',     s:  0.82, up: true  },
  { t: 'MSFT',         f: 'quality',       s:  0.61, up: true  },
  { t: 'NVDA',         f: 'size',          s: -0.43, up: false },
  { t: 'GOOGL',        f: 'value',         s:  0.27, up: true  },
  { t: 'META',         f: 'beta',          s: -0.18, up: false },
  { t: 'RELIANCE.NS',  f: 'quality',       s:  0.71, up: true  },
  { t: 'TCS.NS',       f: 'momentum',      s:  0.55, up: true  },
  { t: 'JPM',          f: 'profitability', s:  0.39, up: true  },
  { t: 'GS',           f: 'value',         s: -0.22, up: false },
  { t: 'INFY.NS',      f: 'momentum',      s:  0.83, up: true  },
  { t: 'HDFCBANK.NS',  f: 'quality',       s:  0.44, up: true  },
  { t: 'AMZN',         f: 'investment',    s: -0.31, up: false },
]

// Double the array so the animation loops seamlessly
const DOUBLED = [...SIGNALS, ...SIGNALS]

export function Ticker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {DOUBLED.map((sig, i) => (
          <div key={i} className="tick">
            <span className="tick-sym">{sig.t}</span>
            <span className="tick-factor">{sig.f}</span>
            <span className={sig.up ? 'tick-up' : 'tick-dn'}>
              {sig.up ? '+' : ''}{sig.s.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
