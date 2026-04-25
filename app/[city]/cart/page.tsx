import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import CartApp from '../../../components_new/cart/CartApp'
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
    title: 'Корзина',
    alternates: {
      canonical: `${base}/${city}/cart`,
      languages: {
        ru: `${base}/${city}/cart`,
        uz: `${base}/uz/${city}/cart`,
        en: `${base}/en/${city}/cart`,
        'x-default': `${base}/${city}/cart`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function CartPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()
  return <CartApp products={[]} />
}
