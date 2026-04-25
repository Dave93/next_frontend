import JsonLd from './JsonLd'
import { SEO_BASE_URL } from '@lib/seo/alternates'

type Props = {
  news: any
  citySlug: string
  locale: string
}

function pickName(news: any, locale: string) {
  if (locale === 'uz') return news?.name_uz || news?.title_uz || news?.name || ''
  if (locale === 'en') return news?.name_en || news?.title_en || news?.name || ''
  return news?.name || news?.title || ''
}

function pickDesc(news: any, locale: string) {
  if (locale === 'uz') return news?.description_uz || news?.description || ''
  if (locale === 'en') return news?.description_en || news?.description || ''
  return news?.description || ''
}

export default function NewsArticleJsonLd({ news, citySlug, locale }: Props) {
  if (!news) return null
  const headline = pickName(news, locale)
  const rawDesc = pickDesc(news, locale)
  const description = String(rawDesc)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600)
  const image = news?.asset?.[0]?.link as string | undefined
  const url =
    locale === 'ru'
      ? `${SEO_BASE_URL}/${citySlug}/news/${news.id}`
      : `${SEO_BASE_URL}/${locale}/${citySlug}/news/${news.id}`
  const datePublished = news?.created_at || news?.published_at || undefined
  const dateModified = news?.updated_at || datePublished

  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description: description || undefined,
    image: image ? [image] : undefined,
    inLanguage: locale,
    datePublished,
    dateModified,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'Chopar Pizza', url: SEO_BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Chopar Pizza',
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_BASE_URL}/icon512x.png`,
      },
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#news-headline', '#news-summary'],
    },
  }

  return <JsonLd data={data} />
}
