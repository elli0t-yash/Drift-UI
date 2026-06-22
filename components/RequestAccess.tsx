'use client'

import { useState } from 'react'

export function RequestAccess() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <section className="section" style={{ textAlign: 'center' }}>
      <div className="sec-label" style={{ textAlign: 'center' }}>
        running a systematic fund?
      </div>
      <h2 className="sec-h2" style={{ textAlign: 'center' }}>
        Get early access
      </h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, maxWidth: 460, margin: '0 auto 32px', fontWeight: 300 }}>
        Drift is available for institutional research use.
        Book a walkthrough or drop your email and we will reach out.
      </p>

      {!sent ? (
        <form
          onSubmit={e => { e.preventDefault(); if (email.includes('@')) setSent(true) }}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <input
            type="email" required placeholder="fund@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)', outline: 'none', width: 260, transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="submit" className="nav-cta" style={{ padding: '10px 24px', fontSize: 13, cursor: 'pointer', border: 'none' }}>
            Request access →
          </button>
        </form>
      ) : (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--teal)', padding: '16px 0' }}>
          ✓ Received — we will be in touch at {email}
        </div>
      )}

      <div style={{ marginTop: 20, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="mailto:yash01012002@gmail.com" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          yash01012002@gmail.com
        </a>
        <span>·</span>
        <a href="https://www.linkedin.com/in/mishra-yash2002/" target="_blank" rel="noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          LinkedIn ↗
        </a>
        <span>·</span>
        <a href="https://github.com/elli0t-yash" target="_blank" rel="noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          GitHub ↗
        </a>
      </div>
    </section>
  )
}
