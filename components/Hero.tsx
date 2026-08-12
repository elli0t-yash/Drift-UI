'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApiKey } from '@/lib/useApiKey'

export function Hero() {
  const [copied, setCopied] = useState(false)
  const { hasKey } = useApiKey()

  const handleCopy = () => {
    navigator.clipboard?.writeText('pip install drift')
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="hero">
      <div className="hero-eye">institutional-grade · open source · AGPL-3.0 + commercial</div>

      <h1 className="hero-h1">
        From log-returns to alpha.<br />
        <em>Fifteen layers. </em>
        <b>Zero black boxes.</b>
      </h1>

      <p className="hero-sub">
        Regime-aware factor weights, self-calibrating Black-Litterman confidence, and
        co-movement graph crisis detection — institutional quant research for Indian
        equities, derived from first principles.
      </p>

      <div className="hero-actions">
        <Link href="/signup" className="nav-cta" style={{ padding: '10px 16px', fontSize: 13 }}>Get started free</Link>
        <Link href="/pricing" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)', textDecoration: 'none', border: '1px solid var(--border)', padding: '9px 16px', borderRadius: 6 }}>View pricing</Link>
        {hasKey && <Link href="/dashboard" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--teal)', textDecoration: 'none' }}>Open dashboard →</Link>}
        <div className="install-box">
          <span>$</span>
          <code>pip install drift</code>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? '✓' : 'copy'}
          </button>
        </div>
        <a
          href="https://github.com/elli0t-yash"
          target="_blank"
          rel="noreferrer"
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            color: 'var(--muted)',
            textDecoration: 'none',
            border: '1px solid var(--border)',
            padding: '9px 16px',
            borderRadius: 6,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--teal)'
            el.style.color = 'var(--teal)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--border)'
            el.style.color = 'var(--muted)'
          }}
        >
          ★ GitHub
        </a>
        <a href="#layers" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
          Architecture →
        </a>
      </div>

      <div className="badges">
        <span className="badge badge-t">drift 0.1.0</span>
        <span className="badge badge-t">15 layers</span>
        <span className="badge badge-t">182 tests</span>
        <span className="badge">PyPI</span>
        <span className="badge">FastAPI</span>
        <span className="badge">MCP-native</span>
      </div>
      <p style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        color: 'var(--muted)',
        marginTop: 20,
        lineHeight: 1.6,
      }}>
        Built on 182 passing tests · companion to{' '}
        <a
          href="https://omnipulseid.vercel.app"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          OmniPulse
        </a>
        {' '}(production audio fingerprinting) · AGPL-3.0 + Commercial licensing
      </p>
    </div>
  )
}
