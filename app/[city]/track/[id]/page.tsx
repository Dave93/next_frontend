import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import TrackClientApp from '../../../../components_new/track/TrackClientApp'
import { getMetaLocale, tr } from '../../../../lib/seo/meta-i18n'
import type { City } from '@commerce/types/cities'

type Params = { city: string; id: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city, id } = await params
  const base = 'https://choparpizza.uz'
  const locale = await getMetaLocale()
  return {
    title: `${tr('orderTracking', locale)} #${id}`,
    alternates: {
      canonical: `${base}/${city}/track/${id}`,
      languages: {
        ru: `${base}/${city}/track/${id}`,
        uz: `${base}/uz/${city}/track/${id}`,
        en: `${base}/en/${city}/track/${id}`,
        'x-default': `${base}/${city}/track/${id}`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function TrackPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()
  return <TrackClientApp orderId={id} />
}
