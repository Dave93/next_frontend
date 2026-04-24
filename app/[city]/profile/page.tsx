import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import UserDataApp from '../../../components_new/profile/UserDataApp'
import MobileProfileMenuApp from '../../../components_new/mobile/MobileProfileMenuApp'
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
    title: 'Мой профиль',
    alternates: {
      canonical: `${base}/${city}/profile`,
      languages: {
        ru: `${base}/${city}/profile`,
        uz: `${base}/uz/${city}/profile`,
        en: `${base}/en/${city}/profile`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function ProfilePage({
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
      <div className="md:hidden">
        <MobileProfileMenuApp />
      </div>
    </>
  )
}
