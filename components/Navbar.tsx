'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const closeMenu = () => setOpen(false)

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

          <button className="nav-theme" onClick={toggleTheme} aria-label="Toggle theme">
            {mounted ? (theme === 'dark' ? '☀ Light' : '◐ Dark') : '◐'}
          </button>

          <a href="#started" className="nav-cta">Get started →</a>
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
          <button className="nav-theme" onClick={() => { toggleTheme(); closeMenu() }} aria-label="Toggle theme">
            {mounted ? (theme === 'dark' ? '☀ Light' : '◐ Dark') : '◐'}
          </button>
          <a href="#started" className="nav-cta" onClick={closeMenu}>Get started →</a>
        </div>
      )}
    </>
  )
}
