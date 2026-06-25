'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApiKey } from '@/lib/useApiKey'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { hasKey, clearApiKey } = useApiKey()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const closeMenu = () => setOpen(false)
  const signOut = () => {
    clearApiKey()
    closeMenu()
    router.push('/signup')
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">📡 drift</Link>

        <div className="nav-links">
          <a href="#layers" className="nav-link">Platform</a>
          <a href="#math" className="nav-link">Math</a>
          <Link href="/math" className="nav-link">Deep dive ↗</Link>
          <a href="#founders" className="nav-link">Founders</a>
          <a
            href="https://github.com/elli0t-yash"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            GitHub ↗
          </a>
          <Link href="/advisor" className="nav-link">Advisors</Link>
          <Link href="/docs" className="nav-link">API docs</Link>
          <Link href="/commercial" className="nav-link">Commercial</Link>
          {hasKey ? <Link href="/dashboard" className="nav-link">Dashboard</Link> : <Link href="/signup" className="nav-link">Sign in</Link>}
          {hasKey && <Link href="/portfolio" className="nav-link">Portfolio</Link>}
          {hasKey && <Link href="/screener" className="nav-link">Screener</Link>}
          {hasKey && <Link href="/regime" className="nav-link">Regime</Link>}
          <Link href="/pricing" className="nav-link">Pricing</Link>

          <button className="nav-theme" onClick={toggleTheme} aria-label="Toggle theme">
            {mounted ? (theme === 'dark' ? '☀ Light' : '◐ Dark') : '◐'}
          </button>

          {hasKey ? <button onClick={signOut} className="nav-cta" style={{ border: 0, cursor: 'pointer' }}>Sign out</button> : <Link href="/signup" className="nav-cta">Get started →</Link>}
        </div>

        <button
          type="button"
          className="nav-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {open && (
        <div className="nav-mobile-menu">
          <a href="#layers" className="nav-link" onClick={closeMenu}>Platform</a>
          <a href="#math" className="nav-link" onClick={closeMenu}>Math</a>
          <Link href="/math" className="nav-link" onClick={closeMenu}>Deep dive ↗</Link>
          <a href="#founders" className="nav-link" onClick={closeMenu}>Founders</a>
          <a href="https://github.com/elli0t-yash" target="_blank" rel="noreferrer" className="nav-link" onClick={closeMenu}>GitHub ↗</a>
          <Link href="/advisor" className="nav-link" onClick={closeMenu}>Advisors</Link>
          <Link href="/docs" className="nav-link" onClick={closeMenu}>API docs</Link>
          <Link href="/commercial" className="nav-link" onClick={closeMenu}>Commercial</Link>
          {hasKey ? <Link href="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link> : <Link href="/signup" className="nav-link" onClick={closeMenu}>Sign in</Link>}
          {hasKey && <Link href="/portfolio" className="nav-link" onClick={closeMenu}>Portfolio</Link>}
          {hasKey && <Link href="/screener" className="nav-link" onClick={closeMenu}>Screener</Link>}
          {hasKey && <Link href="/regime" className="nav-link" onClick={closeMenu}>Regime</Link>}
          <Link href="/pricing" className="nav-link" onClick={closeMenu}>Pricing</Link>
          <button className="nav-theme" onClick={() => { toggleTheme(); closeMenu() }} aria-label="Toggle theme">
            {mounted ? (theme === 'dark' ? '☀ Light' : '◐ Dark') : '◐'}
          </button>
          {hasKey ? <button className="nav-cta" onClick={signOut} style={{ border: 0, cursor: 'pointer' }}>Sign out</button> : <Link href="/signup" className="nav-cta" onClick={closeMenu}>Get started →</Link>}
        </div>
      )}
    </>
  )
}
