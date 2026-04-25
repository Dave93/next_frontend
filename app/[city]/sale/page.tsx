import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import { fetchSalesList } from '../../../lib/data/sales'
import SaleListApp from '../../../components_new/sale/SaleListApp'
import NewsMenuTabsApp from '../../../components_new/news/NewsMenuTabsApp'
import { getMetaLocale, tr } from '../../../lib/seo/meta-i18n'
import type { City } from '@commerce/types/cities'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  const locale = await getMetaLocale()
  return {
    title: tr('sales', locale),
    description: tr('salesDesc', locale),
    alternates: {
      canonical: `${base}/${city}/sale`,
      languages: {
        ru: `${base}/${city}/sale`,
        uz: `${base}/uz/${city}/sale`,
        en: `${base}/en/${city}/sale`,
        'x-default': `${base}/${city}/sale`,
      },
    },
  }
}

export default async function SalePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const sales = await fetchSalesList(currentCity.id, locale)

  return (
    <>
      <NewsMenuTabsApp citySlug={citySlug} />
      <SaleListApp sales={sales} citySlug={citySlug} locale={locale} />
    </>
  )
}
