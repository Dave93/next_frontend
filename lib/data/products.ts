import 'server-only'
import { unstable_cache as cache } from 'next/cache'
import commerce from '@lib/api/commerce'

async function fetchAllProductsRaw(citySlug?: string) {
  const config: any = {
    queryParams: citySlug ? { city: citySlug } : {},
  }
  const result = await commerce.getAllProducts({
    variables: { first: 6 },
    config,
  } as any)
  return ((result as any)?.products as any[]) || []
}

async function fetchProductByIdRaw(id: string, citySlug?: string) {
  const all = await fetchAllProductsRaw(citySlug)
  return all.find((p) => String((p as any).id) === String(id)) || null
}

export const fetchAllProducts = cache(fetchAllProductsRaw, ['products-all'], {
  revalidate: 600,
  tags: ['products'],
})

export const fetchProductById = cache(fetchProductByIdRaw, ['product-by-id'], {
  revalidate: 600,
  tags: ['products'],
})
