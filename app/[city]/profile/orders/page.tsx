import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import UserDataApp from '../../../../components_new/profile/UserDataApp'
import ProfileOrdersApp from '../../../../components_new/profile/OrdersApp'
import { getMetaLocale, tr } from '../../../../lib/seo/meta-i18n'
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
  return {
    title: tr('myOrders', locale),
    alternates: {
      canonical: `${base}/${city}/profile/orders`,
      languages: {
        ru: `${base}/${city}/profile/orders`,
        uz: `${base}/uz/${city}/profile/orders`,
        en: `${base}/en/${city}/profile/orders`,
        'x-default': `${base}/${city}/profile/orders`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function ProfileOrdersPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()
  return (
    <>
      <div className="hidden md:block">
        <UserDataApp />
      </div>
      <div className="mt-4 md:mt-8 mx-3 md:mx-0">
        <h1 className="text-2xl mb-4 md:hidden font-bold">Мои заказы</h1>
        <ProfileOrdersApp />
      </div>
    </>
  )
}
