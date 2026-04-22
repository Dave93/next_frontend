import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
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
    title: 'Заказ оформлен',
    alternates: {
      canonical: `${base}/${city}/order/success`,
      languages: {
        ru: `${base}/${city}/order/success`,
        uz: `${base}/uz/${city}/order/success`,
        en: `${base}/en/${city}/order/success`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()
  return (
    <div className="text-3xl text-center py-16">
      Спасибо! Ваш заказ оформлен.
    </div>
  )
}
