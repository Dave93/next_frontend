import type { MetadataRoute } from 'next'
import { fetchSiteInfo } from '../lib/data/site-info'
import { fetchAllProducts } from '../lib/data/products'
import { fetchNewsList } from '../lib/data/news'
import { fetchSalesList } from '../lib/data/sales'
import { SEO_LOCALES, SEO_BASE_URL, localizedPath } from '../lib/seo/alternates'

export const revalidate = 3600

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/about/fran', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/contacts', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/delivery', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/branch', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/sale', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/news', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
]

function buildAlternates(path: string) {
  const ru = localizedPath('ru', path)
  return {
    languages: {
      ru,
      uz: localizedPath('uz', path),
      en: localizedPath('en', path),
      'x-default': ru,
    },
  }
}

function entry(
  locale: (typeof SEO_LOCALES)[number],
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
  lastModified: Date,
  images?: string[]
): MetadataRoute.Sitemap[number] {
  return {
    url: localizedPath(locale, path),
    lastModified,
    changeFrequency,
    priority,
    alternates: buildAlternates(path),
    ...(images && images.length ? { images } : {}),
  }
}

function uniqueProducts(productsResp: any[]): { id: string; image?: string }[] {
  if (!Array.isArray(productsResp)) return []
  const seen = new Set<string>()
  const out: { id: string; image?: string }[] = []
  for (const cat of productsResp) {
    const items = Array.isArray(cat?.items) ? cat.items : []
    for (const item of items) {
      const id = String(item?.id || '')
      if (!id || seen.has(id)) continue
      seen.add(id)
      out.push({ id, image: item?.image || undefined })
    }
  }
  return out
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const siteInfo = await fetchSiteInfo()
  const cities = ((siteInfo as any)?.cities || []) as Array<{
    id: number
    slug: string
    active: boolean
  }>
  const activeCities = cities.filter((c) => c.active)

  const out: MetadataRoute.Sitemap = []

  for (const city of activeCities) {
    for (const block of STATIC_PATHS) {
      const path = `/${city.slug}${block.path}`
      for (const locale of SEO_LOCALES) {
        out.push(entry(locale, path, block.changeFrequency, block.priority, now))
      }
    }

    let products: any[] = []
    try {
      products = await fetchAllProducts(city.slug)
    } catch {
      products = []
    }
    const productList = uniqueProducts(products)
    for (const p of productList) {
      const path = `/${city.slug}/product/${p.id}`
      for (const locale of SEO_LOCALES) {
        out.push(
          entry(
            locale,
            path,
            'weekly',
            0.8,
            now,
            p.image ? [p.image] : undefined
          )
        )
      }
    }

    let newsList: any[] = []
    try {
      newsList = await fetchNewsList(city.id, 'ru')
    } catch {
      newsList = []
    }
    for (const n of newsList) {
      const id = String(n?.id || n?.slug || '')
      if (!id) continue
      const path = `/${city.slug}/news/${id}`
      const lastMod = n?.updated_at ? new Date(n.updated_at) : now
      for (const locale of SEO_LOCALES) {
        out.push(entry(locale, path, 'weekly', 0.6, lastMod))
      }
    }

    let salesList: any[] = []
    try {
      salesList = await fetchSalesList(city.id, 'ru')
    } catch {
      salesList = []
    }
    for (const s of salesList) {
      const id = String(s?.id || s?.slug || '')
      if (!id) continue
      const path = `/${city.slug}/sale/${id}`
      const lastMod = s?.updated_at ? new Date(s.updated_at) : now
      for (const locale of SEO_LOCALES) {
        out.push(entry(locale, path, 'weekly', 0.7, lastMod))
      }
    }
  }

  return out
}

export type SitemapBaseUrl = typeof SEO_BASE_URL
