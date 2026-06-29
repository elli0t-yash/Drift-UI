import { Navbar }      from '@/components/Navbar'
import { Ticker }      from '@/components/Ticker'
import { Hero }        from '@/components/Hero'
import { Problem }     from '@/components/Problem'
import { Pillars }     from '@/components/Pillars'
import { BarDemo }     from '@/components/BarDemo'
import { DemoSection } from '@/components/DemoSection'
import { FAQ }         from '@/components/FAQ'
import { Layers }      from '@/components/Layers'
import { GetStarted }  from '@/components/GetStarted'
import { Founders }    from '@/components/Founders'
import { Licensing }   from '@/components/Licensing'
import { RequestAccess } from '@/components/RequestAccess'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Navbar />
      <Ticker />
      <Hero />
      <Problem />
      <Pillars />
      <BarDemo />
      <DemoSection />
      <FAQ />
      <Layers />
      <GetStarted />
      <Founders />
      <Licensing />
      <RequestAccess />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', margin: '-36px auto 72px', padding: '0 24px' }}>
        <Link href="/advisor" style={{
          fontFamily: "var(--mono)", fontSize: 13,
          color: "var(--muted)", textDecoration: "none",
          border: "1px solid var(--border)", padding: "10px 20px",
          borderRadius: 6,
        }}>
          For advisors →
        </Link>

        <Link href="/docs" style={{
          fontFamily: "var(--mono)", fontSize: 13,
          color: "var(--muted)", textDecoration: "none",
          border: "1px solid var(--border)", padding: "10px 20px",
          borderRadius: 6,
        }}>
          API docs →
        </Link>
      </div>

      <footer>
        <span className="footer-logo">📡 drift</span>
        <span className="footer-copy">
          © 2026 Drift ·{' '}
          <a href="#licensing">AGPL-3.0 + Commercial licensing</a>
          {' '}·{' '}
          <a href="/advisor">Advisors</a>
          {' '}·{' '}
          <a href="/docs">API</a>
          {' '}·{' '}
          <a href="/commercial">Commercial</a>
          {' '}·{' '}
          <a href="https://github.com/elli0t-yash" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          {' '}·{' '}
          <a href="https://omnipulseid.vercel.app" target="_blank" rel="noreferrer">
            omnipulseid.vercel.app ↗
          </a>
        </span>
      </footer>
    </>
  )
}
