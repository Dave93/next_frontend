import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import BonusListApp from '../../../components_new/bonus/BonusListApp'
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
    title: tr('bonuses', locale),
    alternates: {
      canonical: `${base}/${city}/_bonus`,
      languages: {
        ru: `${base}/${city}/_bonus`,
        uz: `${base}/uz/${city}/_bonus`,
        en: `${base}/en/${city}/_bonus`,
        'x-default': `${base}/${city}/_bonus`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function BonusListPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()
  return <BonusListApp />
}
