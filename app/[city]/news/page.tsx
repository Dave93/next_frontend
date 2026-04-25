import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import { fetchNewsList } from '../../../lib/data/news'
import NewsListApp from '../../../components_new/news/NewsListApp'
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
    title: tr('news', locale),
    description: tr('newsDesc', locale),
    alternates: {
      canonical: `${base}/${city}/news`,
      languages: {
        ru: `${base}/${city}/news`,
        uz: `${base}/uz/${city}/news`,
        en: `${base}/en/${city}/news`,
        'x-default': `${base}/${city}/news`,
      },
    },
  }
}

export default async function NewsPage({
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

  const news = await fetchNewsList(currentCity.id, locale)

  return (
    <>
      <NewsMenuTabsApp citySlug={citySlug} />
      <NewsListApp news={news} citySlug={citySlug} locale={locale} />
    </>
  )
}
