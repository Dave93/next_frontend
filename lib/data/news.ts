import 'server-only'
import { unstable_cache as cache } from 'next/cache'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

async function fetchNewsListRaw(cityId: number, locale: string) {
  const res = await fetch(
    `${apiUrl()}/api/news/public?city_id=${cityId}&locale=${locale}`,
    { next: { revalidate: 300, tags: ['news', `news-list-${cityId}`] } }
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

async function fetchNewsByIdRaw(id: string, cityId: number) {
  const res = await fetch(
    `${apiUrl()}/api/news/public/${id}/?city_id=${cityId}`,
    { next: { revalidate: 600, tags: [`news-${id}`] } }
  )
  if (!res.ok) return null
  const json = (await res.json()) as { data?: any[] }
  return json.data?.[0] || null
}

async function fetchRelatedNewsRaw(id: string, cityId: number) {
  const res = await fetch(
    `${apiUrl()}/api/news/related/${id}/?city_id=${cityId}`,
    { next: { revalidate: 600, tags: [`news-related-${id}`] } }
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

export const fetchNewsList = cache(fetchNewsListRaw, ['news-list'], {
  revalidate: 300,
  tags: ['news'],
})

export const fetchNewsById = cache(fetchNewsByIdRaw, ['news-by-id'], {
  revalidate: 600,
  tags: ['news'],
})

export const fetchRelatedNews = cache(fetchRelatedNewsRaw, ['news-related'], {
  revalidate: 600,
  tags: ['news'],
})
