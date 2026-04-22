import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../lib/data/site-info'
import LayoutWrapper from './LayoutWrapper'
import type { City } from '@commerce/types/cities'

export const dynamicParams = true

export async function generateStaticParams() {
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  return cities.map((c) => ({ city: c.slug }))
}

export default async function CityLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ city: string }>
}) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  return (
    <LayoutWrapper pageProps={{ cities, currentCity }}>
      {children}
    </LayoutWrapper>
  )
}
