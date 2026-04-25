import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import BonusStartApp from '../../../../components_new/bonus/BonusStartApp'
import type { City } from '@commerce/types/cities'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Начать бонусную программу',
    alternates: {
      canonical: `${base}/${city}/_bonus/start`,
      languages: {
        ru: `${base}/${city}/_bonus/start`,
        uz: `${base}/uz/${city}/_bonus/start`,
        en: `${base}/en/${city}/_bonus/start`,
        'x-default': `${base}/${city}/_bonus/start`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function BonusStartPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()
  return (
    <BonusStartApp
      isBonusListSuccess={false}
      errorMessage=""
      bonusList={[]}
    />
  )
}
