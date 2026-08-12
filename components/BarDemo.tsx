'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export function BarDemo() {
  const [outlier, setOutlier] = useState(5.0)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  useEffect(() => setMounted(true), [])

  const N   = 5
  const raw = [0.1, 0.2, 0.3, 0.4, outlier]
  const sorted = [...raw].sort((a, b) => a - b)
  const mean   = raw.reduce((s, x) => s + x, 0) / N
  const std    = Math.sqrt(raw.map(x => (x - mean) ** 2).reduce((s, x) => s + x, 0) / N) || 1

  const data = raw.map((v, i) => {
    const rank = sorted.indexOf(v) + 1
    const rs   = (2 * rank - N - 1) / (N - 1)
    const zs   = (v - mean) / std
    return { lbl: i < 4 ? `v${i + 1}` : 'outlier', rs: +rs.toFixed(2), zs: +zs.toFixed(2), isOut: i === 4 }
  })

  const maxZ = Math.max(...data.map(d => Math.abs(d.zs))) || 1
  const isLight = mounted && theme === 'light'
  const barN  = isLight ? '#DCE4EF' : '#1E3A54'
  const barT  = isLight ? '#00967A' : '#00C896'
  const barR  = isLight ? '#DC2626' : '#EF4444'

  return (
    <section className="section">
      <div className="sec-label">interactive proof</div>
      <h2 className="sec-h2">Why rank transform</h2>
      <p className="sec-sub">Drag the outlier to any value and watch what happens to the z-score.</p>

      <div className="demo-box">
        <div className="demo-h">Rank transform kills outliers</div>
        <div className="demo-s">
          Drag the outlier. Rank score stays in [−1, +1]. Z-score explodes.
        </div>

        <div className="slider-row">
          <label>Outlier value</label>
          <input
            type="range" min={0.5} max={50} step={0.5} value={outlier}
            onChange={e => setOutlier(parseFloat(e.target.value))}
          />
          <span className="slider-val">{outlier.toFixed(1)}</span>
        </div>

        <div className="charts-row">
          <div>
            <div className="chart-lbl">rank score — s = (2r − N − 1) / (N − 1)</div>
            <div className="bars">
              {data.map(d => (
                <div key={d.lbl} className="bcol">
                  <div className="bbar" style={{
                    height: `${(Math.abs(d.rs) * 55).toFixed(2)}px`,
                    background: d.isOut ? barT : barN,
                    marginTop: 'auto',
                    border: d.isOut ? `1px solid ${barT}` : 'none',
                  }} />
                  <div className="btick">{d.lbl}</div>
                  <div className="btick" style={{ color: d.isOut ? barT : 'var(--muted)' }}>
                    {d.rs}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="chart-lbl">z-score — unbounded, outlier dominates</div>
            <div className="bars">
              {data.map(d => (
                <div key={d.lbl} className="bcol">
                  <div className="bbar" style={{
                    height: `${((Math.abs(d.zs) / maxZ) * 110).toFixed(2)}px`,
                    background: d.isOut ? barR : barN,
                    marginTop: 'auto',
                    border: d.isOut ? `1px solid ${barR}` : 'none',
                  }} />
                  <div className="btick">{d.lbl}</div>
                  <div className="btick" style={{ color: d.isOut ? barR : 'var(--muted)' }}>
                    {Math.abs(d.zs) > 9 ? `+${d.zs.toFixed(0)}σ` : d.zs.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="insight">
          Outlier = {outlier.toFixed(1)} · rank score = +1.00 (capped) · z-score = +{data[4].zs.toFixed(2)}σ (uncapped)
        </div>
      </div>
    </section>
  )
}
