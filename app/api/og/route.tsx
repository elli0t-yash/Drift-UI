import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      background: '#06090F',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '60px 80px',
      fontFamily: 'monospace',
    }}>
      <div style={{ color: '#00C896', fontSize: 18, letterSpacing: 4, marginBottom: 24 }}>
        📡 DRIFT
      </div>
      <div style={{ color: '#F0F4F8', fontSize: 54, fontWeight: 700, lineHeight: 1.1, marginBottom: 28 }}>
        Systematic alpha,{'\n'}derived from{'\n'}first principles.
      </div>
      <div style={{ color: '#64748B', fontSize: 20, lineHeight: 1.6 }}>
        Seven layers · 182 tests · AGPL-3.0 + Commercial licensing
      </div>
      <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
        {['WST features','IC / ICIR','Black-Litterman','HRP','CVaR','PSR'].map(b => (
          <div key={b} style={{ border: '1px solid #1E2D40', borderRadius: 4, padding: '5px 14px', color: '#64748B', fontSize: 13 }}>{b}</div>
        ))}
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
