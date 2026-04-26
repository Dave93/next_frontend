import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../lib/data/site-info'
import { getCityMenu } from '../../lib/data/products'
import { fetchSliders } from '../../lib/data/sliders'
import ClientCatalogFull from '../../components_new/main/islands/ClientCatalogFull'
import MenuJsonLd from '../../components_new/seo/MenuJsonLd'
import { cityNameInLocative, getMetaLocale, tr } from '../../lib/seo/meta-i18n'
import type { City } from '@commerce/types/cities'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  const locale = await getMetaLocale()
  const cityLoc = cityNameInLocative(city, locale)
  return {
    title: tr('homeTitle', locale, { city: cityLoc }),
    description: tr('homeDesc', locale, { city: cityLoc }),
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
  const locale = await getLocale()

  const [siteInfo, sliders, menu] = await Promise.all([
    fetchSiteInfo(),
    fetchSliders(locale),
    getCityMenu(citySlug, locale),
  ])

  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  return (
    <>
      <MenuJsonLd menu={menu} />
      <ClientCatalogFull
        citySlug={citySlug}
        locale={locale}
        channelName="chopar"
        categories={(siteInfo as any).categories || []}
        sliders={sliders}
        initialMenu={menu}
      />
    </>
  )
}
