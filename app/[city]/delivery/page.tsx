import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import DeliveryApp from '../../../components_new/delivery/DeliveryApp'
import BreadcrumbsJsonLd from '../../../components_new/seo/BreadcrumbsJsonLd'
import { crumbLabel, localizedPath } from '../../../lib/seo/alternates'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Доставка и оплата',
    description: 'Как сделать заказ, инструкция и дополнительная информация',
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
      <DeliveryApp />
    </>
  )
}
