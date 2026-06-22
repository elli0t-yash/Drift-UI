import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://drift-site-livid.vercel.app'),
  title: 'Drift — Systematic alpha, derived from first principles',
  description:
    'Seven-layer quantitative research platform. WST feature extraction, IC-weighted signal composition, and Bayesian portfolio construction.',
  openGraph: {
    title: 'Drift — Systematic alpha, derived from first principles',
    description:
      'Wavelet scattering features, IC-weighted signal composition, and Bayesian portfolio construction — derived from first principles, covered by 182 tests.',
    url: 'https://drift-site-livid.vercel.app',
    siteName: 'Drift',
    locale: 'en_US',
    type: 'website',
    images: [{ url: 'https://drift-site-livid.vercel.app/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drift — Systematic alpha platform',
    description: 'Seven layers from log-returns to optimal weights.',
    images: ['https://drift-site-livid.vercel.app/api/og'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${mono.variable} ${sans.variable}`}>
      <body>
        {/*
          attribute="data-theme" so our CSS [data-theme="light"] selectors work.
          defaultTheme="dark" matches the product aesthetic.
          enableSystem=false — we control this manually.
        */}
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
