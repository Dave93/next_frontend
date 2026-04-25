import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import OrderCheckoutClient from './OrderCheckoutClient'
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
    title: 'Оформление заказа',
    alternates: {
      canonical: `${base}/${city}/order`,
      languages: {
        ru: `${base}/${city}/order`,
        uz: `${base}/uz/${city}/order`,
        en: `${base}/en/${city}/order`,
        'x-default': `${base}/${city}/order`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function OrderCheckoutPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()

  return <OrderCheckoutClient channelName="chopar" />
}
