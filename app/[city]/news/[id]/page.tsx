import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import { fetchNewsById, fetchRelatedNews } from '../../../../lib/data/news'
import NewsDetailApp from '../../../../components_new/news/NewsDetailApp'
import NewsMenuTabsApp from '../../../../components_new/news/NewsMenuTabsApp'
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
    title: 'Новость Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/news/${id}`,
      languages: {
        ru: `${base}/${city}/news/${id}`,
        uz: `${base}/uz/${city}/news/${id}`,
        en: `${base}/en/${city}/news/${id}`,
      },
    },
  }
}

export default async function NewsDetailPage({
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

  const news = await fetchNewsById(id, currentCity.id)
  if (!news) notFound()

  const relatedNews = await fetchRelatedNews(id, currentCity.id)

  return (
    <>
      <NewsMenuTabsApp citySlug={citySlug} />
      <NewsDetailApp
        news={news}
        relatedNews={relatedNews}
        citySlug={citySlug}
        locale={locale}
      />
    </>
  )
}
