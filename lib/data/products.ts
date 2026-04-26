import 'server-only'
import { unstable_cache as cache } from 'next/cache'
import commerce from '@lib/api/commerce'
import { toSlimMenu, type SlimMenu } from './menu-dto'

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

async function getCityMenuRaw(
  citySlug: string,
  locale: string
): Promise<SlimMenu> {
  const raw = await fetchAllProductsRaw(citySlug)
  return toSlimMenu(raw, citySlug, locale)
}

async function fetchProductByIdRaw(id: string, citySlug?: string) {
  const all = await fetchAllProductsRaw(citySlug)
  const target = String(id)
  for (const cat of all as any[]) {
    if (String(cat?.id) === target) return cat
    const items = Array.isArray(cat?.items) ? cat.items : []
    for (const item of items) {
      if (String(item?.id) === target) return item
      const variants = Array.isArray(item?.variants) ? item.variants : []
      for (const v of variants) {
        if (String(v?.id) === target) return item
      }
    }
  }
  return null
}

export const fetchAllProducts = cache(fetchAllProductsRaw, ['products-all'], {
  revalidate: 600,
  tags: ['products'],
})

export const fetchProductById = cache(
  fetchProductByIdRaw,
  ['product-by-id-v2'],
  {
    revalidate: 600,
    tags: ['products'],
  }
)

export const getCityMenu = cache(getCityMenuRaw, ['city-menu-v1'], {
  revalidate: 3600,
  tags: ['menu', 'products'],
})
