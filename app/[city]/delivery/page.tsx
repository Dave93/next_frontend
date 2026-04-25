import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import DeliveryApp from '../../../components_new/delivery/DeliveryApp'
import BreadcrumbsJsonLd from '../../../components_new/seo/BreadcrumbsJsonLd'
import FaqJsonLd from '../../../components_new/seo/FaqJsonLd'
import { crumbLabel, localizedPath } from '../../../lib/seo/alternates'
import { DELIVERY_FAQ } from '../../../lib/seo/faq'
import { getMetaLocale, tr } from '../../../lib/seo/meta-i18n'

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
    title: tr('deliveryAndPayment', locale),
    description: tr('deliveryAndPaymentDesc', locale),
    alternates: {
      canonical: `${base}/${city}/delivery`,
      languages: {
        ru: `${base}/${city}/delivery`,
        uz: `${base}/uz/${city}/delivery`,
        en: `${base}/en/${city}/delivery`,
        'x-default': `${base}/${city}/delivery`,
      },
    },
  }
}

export default async function DeliveryPage({
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
          {
            name: crumbLabel(loc, 'delivery'),
            url: localizedPath(loc, `/${citySlug}/delivery`),
          },
        ]}
      />
      <FaqJsonLd items={DELIVERY_FAQ[loc]} />
      <DeliveryApp />
    </>
  )
}
