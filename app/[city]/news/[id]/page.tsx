import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import { fetchNewsById, fetchRelatedNews } from '../../../../lib/data/news'
import NewsDetailApp from '../../../../components_new/news/NewsDetailApp'
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
  const locale = (await getLocale()) as 'ru' | 'uz' | 'en'
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === city)
  const news = currentCity ? await fetchNewsById(id, currentCity.id) : null
  const title =
    (locale === 'uz' && (news as any)?.title_uz) ||
    (locale === 'en' && (news as any)?.title_en) ||
    (news as any)?.title ||
    'Новость Chopar Pizza'
  const rawDesc =
    (locale === 'uz' && (news as any)?.description_uz) ||
    (locale === 'en' && (news as any)?.description_en) ||
    (news as any)?.description ||
    ''
  const description =
    String(rawDesc)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) || undefined
  return {
    title: {
      absolute:
        title === 'Новость Chopar Pizza' ? title : `${title} | Chopar Pizza`,
    },
    description,
    alternates: {
      canonical: `${base}/${city}/news/${id}`,
      languages: {
        ru: `${base}/${city}/news/${id}`,
        uz: `${base}/uz/${city}/news/${id}`,
        en: `${base}/en/${city}/news/${id}`,
        'x-default': `${base}/${city}/news/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${base}/${city}/news/${id}`,
      type: 'article',
      images: (news as any)?.image
        ? [{ url: (news as any).image, alt: title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: (news as any)?.image ? [(news as any).image] : undefined,
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

  const loc = locale as 'ru' | 'uz' | 'en'
  const newsTitle =
    (loc === 'uz' && (news as any)?.title_uz) ||
    (loc === 'en' && (news as any)?.title_en) ||
    (news as any)?.title ||
    ''
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: crumbLabel(loc, 'home'), url: localizedPath(loc, `/${citySlug}`) },
          { name: crumbLabel(loc, 'news'), url: localizedPath(loc, `/${citySlug}/news`) },
          { name: newsTitle, url: localizedPath(loc, `/${citySlug}/news/${id}`) },
        ]}
      />
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
