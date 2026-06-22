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

      <footer>
        <span className="footer-logo">📡 drift</span>
        <span className="footer-copy">
          © 2026 Drift ·{' '}
          <a href="#licensing">AGPL-3.0 + Commercial licensing</a>
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
