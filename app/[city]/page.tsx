import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../lib/data/site-info'
import { fetchAllProducts } from '../../lib/data/products'
import { fetchSliders } from '../../lib/data/sliders'
import CityMainApp from '../../components_new/main/CityMainApp'
import MenuJsonLd from '../../components_new/seo/MenuJsonLd'
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
    title: 'Заказать пиццу с доставкой в Ташкенте | Chopar Pizza',
    description:
      'Бесплатная доставка пиццы в Ташкенте, заказать можно на нашем сайте или через телеграм бот @Chopar_bot',
    alternates: {
      canonical: `${base}/${city}`,
      languages: {
        ru: `${base}/${city}`,
        uz: `${base}/uz/${city}`,
        en: `${base}/en/${city}`,
        'x-default': `${base}/${city}`,
      },
    },
    openGraph: {
      url: `${base}/${city}`,
      images: [
        {
          url: 'https://choparpizza.uz/icon512x.png',
          width: 800,
          height: 600,
          alt: 'Chopar Pizza',
        },
      ],
    },
  }
}

export default async function CityHomePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const [products, sliders] = await Promise.all([
    fetchAllProducts(citySlug),
    fetchSliders(locale),
  ])

  return (
    <>
      <MenuJsonLd
        citySlug={citySlug}
        locale={locale}
        categories={products as any[]}
      />
      <CityMainApp
        products={products}
        categories={(siteInfo as any).categories || []}
        sliders={sliders}
        channelName="chopar"
      />
    </>
  )
}
