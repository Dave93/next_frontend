import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import OrderAcceptApp from '../../../../components_new/order/OrderAcceptApp'
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
    title: `${tr('orderNumber', locale)} #${id}`,
    alternates: {
      canonical: `${base}/${city}/order/${id}`,
      languages: {
        ru: `${base}/${city}/order/${id}`,
        uz: `${base}/uz/${city}/order/${id}`,
        en: `${base}/en/${city}/order/${id}`,
        'x-default': `${base}/${city}/order/${id}`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()
  return <OrderAcceptApp orderId={id} />
}
