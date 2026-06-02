import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import AboutApp from '../../../components_new/about/AboutApp'
import BreadcrumbsJsonLd from '../../../components_new/seo/BreadcrumbsJsonLd'
import {
  crumbLabel,
  localizedPath,
  staticPageAlternates,
  CANONICAL_CITY,
  SEO_BASE_URL,
} from '../../../lib/seo/alternates'
import { getMetaLocale, tr } from '../../../lib/seo/meta-i18n'

type Params = { city: string }

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMetaLocale()
  return {
    title: tr('about', locale),
    description: tr('aboutDesc', locale),
    alternates: staticPageAlternates('/about'),
    openGraph: {
      url: `${SEO_BASE_URL}/${CANONICAL_CITY}/about`,
      type: 'website',
    },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const loc = (await getLocale()) as 'ru' | 'uz' | 'en'
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: crumbLabel(loc, 'home'), url: localizedPath(loc, `/${citySlug}`) },
          { name: crumbLabel(loc, 'about'), url: localizedPath(loc, `/${citySlug}/about`) },
        ]}
      />
      <AboutApp />
    </>
  )
}
