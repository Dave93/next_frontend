import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import type { City } from '@commerce/types/cities'

// Checkout forms are auth-/cart-driven and break under SSR — keep them client-only,
// matching the legacy pages router behaviour.
const OrdersApp = dynamic(
  () => import('../../../components_new/order/OrdersApp'),
  { ssr: false }
)
const MobileOrdersApp = dynamic(
  () => import('../../../components_new/order/MobileOrdersApp'),
  { ssr: false }
)

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

  const channelName = 'chopar'
  return (
    <>
      <div className="md:hidden">
        <MobileOrdersApp channelName={channelName} />
      </div>
      <div className="hidden md:block">
        <OrdersApp channelName={channelName} />
      </div>
    </>
  )
}
