import 'server-only'
import { unstable_cache as cache } from 'next/cache'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

async function fetchSalesListRaw(cityId: number, locale: string) {
  const res = await fetch(
    `${apiUrl()}/api/sales/public?city_id=${cityId}&locale=${locale}`,
    { next: { revalidate: 300, tags: ['sales', `sales-list-${cityId}`] } }
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

async function fetchSaleByIdRaw(id: string, cityId: number) {
  const res = await fetch(
    `${apiUrl()}/api/sales/public/${id}/?city_id=${cityId}`,
    { next: { revalidate: 600, tags: [`sale-${id}`] } }
  )
  if (!res.ok) return null
  const json = (await res.json()) as { data?: any[] }
  return json.data?.[0] || null
}

async function fetchRelatedSalesRaw(id: string, cityId: number, locale: string) {
  const res = await fetch(
    `${apiUrl()}/api/sales/related/${id}/?city_id=${cityId}&locale=${locale}`,
    { next: { revalidate: 600, tags: [`sale-related-${id}`] } }
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

export const fetchSalesList = cache(fetchSalesListRaw, ['sales-list'], {
  revalidate: 300,
  tags: ['sales'],
})

export const fetchSaleById = cache(fetchSaleByIdRaw, ['sale-by-id'], {
  revalidate: 600,
  tags: ['sales'],
})

export const fetchRelatedSales = cache(fetchRelatedSalesRaw, ['sales-related'], {
  revalidate: 600,
  tags: ['sales'],
})
