import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import UserDataApp from '../../../../components_new/profile/UserDataApp'
import AddressApp from '../../../../components_new/profile/AddressApp'
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
    title: tr('myAddresses', locale),
    alternates: {
      canonical: `${base}/${city}/profile/address`,
      languages: {
        ru: `${base}/${city}/profile/address`,
        uz: `${base}/uz/${city}/profile/address`,
        en: `${base}/en/${city}/profile/address`,
        'x-default': `${base}/${city}/profile/address`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function ProfileAddressPage({
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
        <h1 className="text-2xl mb-4 md:hidden font-bold">Мои адреса</h1>
        <AddressApp />
      </div>
    </>
  )
}
