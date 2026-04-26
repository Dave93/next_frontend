import { NextResponse } from 'next/server'
import { getCityMenu } from '../../../../../lib/data/products'
import { fetchSiteInfo } from '../../../../../lib/data/site-info'
import type { City } from '@commerce/types/cities'

const ALLOWED_LOCALES = new Set(['ru', 'uz', 'en'])

type Params = { city: string; locale: string }

export async function GET(
  _req: Request,
  ctx: { params: Promise<Params> }
) {
  const { city, locale } = await ctx.params

  if (!ALLOWED_LOCALES.has(locale)) {
    return NextResponse.json(
      { error: 'Unsupported locale' },
      { status: 400 }
    )
  }

  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[] | undefined
  if (!cities?.some((c) => c.slug === city)) {
    return NextResponse.json({ error: 'Unknown city' }, { status: 404 })
  }

  const menu = await getCityMenu(city, locale)

  return NextResponse.json(menu, {
    headers: {
      'Cache-Control':
        'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, s-maxage=3600',
      Vary: 'Accept-Encoding',
    },
  })
}
