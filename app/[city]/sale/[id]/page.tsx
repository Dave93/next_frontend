import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import { fetchSaleById, fetchRelatedSales } from '../../../../lib/data/sales'
import SaleDetailApp from '../../../../components_new/sale/SaleDetailApp'
import NewsMenuTabsApp from '../../../../components_new/news/NewsMenuTabsApp'
import BreadcrumbsJsonLd from '../../../../components_new/seo/BreadcrumbsJsonLd'
import { crumbLabel, localizedPath } from '../../../../lib/seo/alternates'
import type { City } from '@commerce/types/cities'

type Params = { city: string; id: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city, id } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Акция Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/sale/${id}`,
      languages: {
        ru: `${base}/${city}/sale/${id}`,
        uz: `${base}/uz/${city}/sale/${id}`,
        en: `${base}/en/${city}/sale/${id}`,
      },
    },
  }
}

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const sale = await fetchSaleById(id, currentCity.id)
  if (!sale) notFound()

  const relatedSale = await fetchRelatedSales(id, currentCity.id, locale)

  const loc = locale as 'ru' | 'uz' | 'en'
  const saleTitle =
    (loc === 'uz' && (sale as any)?.title_uz) ||
    (loc === 'en' && (sale as any)?.title_en) ||
    (sale as any)?.title ||
    ''
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: crumbLabel(loc, 'home'), url: localizedPath(loc, `/${citySlug}`) },
          { name: crumbLabel(loc, 'sale'), url: localizedPath(loc, `/${citySlug}/sale`) },
          { name: saleTitle, url: localizedPath(loc, `/${citySlug}/sale/${id}`) },
        ]}
      />
      <NewsMenuTabsApp citySlug={citySlug} />
      <SaleDetailApp
        sale={sale}
        relatedSale={relatedSale}
        citySlug={citySlug}
        locale={locale}
      />
    </>
  )
}
