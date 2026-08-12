'use client'

import { useEffect, useState } from 'react'

const LAYERS = [
  { id: 'l1',  label: 'L1 — Returns',                    col: '#00C896' },
  { id: 'l2a', label: 'L2 — Rank Transform',             col: '#818CF8' },
  { id: 'l2b', label: 'L4 — Regime Engine',              col: '#818CF8' },
  { id: 'l2c', label: 'L6 — WST Stability',              col: '#818CF8' },
  { id: 'l3',  label: 'L3 — IC & ICIR',                  col: '#F59E0B' },
  { id: 'l4a', label: 'L8 — Black-Litterman (endo. Ω)',  col: '#3B82F6' },
  { id: 'l4b', label: 'L10 — HRP Allocation',            col: '#3B82F6' },
  { id: 'l4c', label: 'L14 — CVaR',                      col: '#3B82F6' },
  { id: 'l5',  label: 'L9 — Covariance & Risk',          col: '#F59E0B' },
  { id: 'l6',  label: 'L15 — Backtest / PSR / DSR',      col: '#00C896' },
]

export function MathSidebar() {
  const [active, setActive] = useState('l1')

  useEffect(() => {
    const obs: IntersectionObserver[] = []
    LAYERS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id) },
        { rootMargin: '-15% 0px -75% 0px' }
      )
      o.observe(el)
      obs.push(o)
    })
    return () => obs.forEach(o => o.disconnect())
  }, [])

  return (
    <aside style={{ paddingTop: 48, paddingRight: 32 }}>
      <div style={{ position: 'sticky', top: 68 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>layers</div>
        {LAYERS.map(l => (
          <a key={l.id} href={`#${l.id}`} style={{
            display: 'block',
            fontFamily: 'var(--mono)', fontSize: 11,
            color: active === l.id ? l.col : 'var(--muted)',
            borderLeft: `2px solid ${active === l.id ? l.col : 'var(--border)'}`,
            padding: '5px 0 5px 12px',
            textDecoration: 'none', marginBottom: 2,
            transition: 'all 0.15s',
            fontWeight: active === l.id ? 600 : 400,
          }}>
            {l.label}
          </a>
        ))}
      </div>
    </aside>
  )
}
