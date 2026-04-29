import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../lib/data/site-info'
import { fetchPublicConfig } from '../../lib/data/configs'
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
  modal,
  params,
}: {
  children: React.ReactNode
  modal: React.ReactNode
  params: Promise<{ city: string }>
}) {
  const { city: citySlug } = await params
  const [siteInfo, config, locale] = await Promise.all([
    fetchSiteInfo(),
    fetchPublicConfig().catch(() => ({}) as Awaited<ReturnType<typeof fetchPublicConfig>>),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  return (
    <LayoutWrapper
      modal={modal}
      pageProps={{
        cities,
        currentCity,
        categories: siteInfo.categories,
        footerInfoMenu: siteInfo.footerInfoMenu,
        socials: siteInfo.socials,
        config,
        locale,
      }}
    >
      {children}
    </LayoutWrapper>
  )
}
