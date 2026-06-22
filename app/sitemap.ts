import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://drift-site-livid.vercel.app',      lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: 'https://drift-site-livid.vercel.app/math', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
