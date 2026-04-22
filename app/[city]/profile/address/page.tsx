import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import UserDataApp from '../../../../components_new/profile/UserDataApp'
import AddressApp from '../../../../components_new/profile/AddressApp'
import MobileProfileMenuApp from '../../../../components_new/mobile/MobileProfileMenuApp'
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
    title: 'Мои адреса',
    alternates: {
      canonical: `${base}/${city}/profile/address`,
      languages: {
        ru: `${base}/${city}/profile/address`,
        uz: `${base}/uz/${city}/profile/address`,
        en: `${base}/en/${city}/profile/address`,
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
      <div className="hidden md:flex">
        <div className="w-64">
          <UserDataApp />
        </div>
        <div className="flex-1">
          <AddressApp />
        </div>
      </div>
      <div className="md:hidden">
        <MobileProfileMenuApp />
      </div>
    </>
  )
}
