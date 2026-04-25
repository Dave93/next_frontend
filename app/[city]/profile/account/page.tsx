import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import UserDataApp from '../../../../components_new/profile/UserDataApp'
import PersonalDataApp from '../../../../components_new/profile/PersonalDataApp'
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
    title: 'Личные данные',
    alternates: {
      canonical: `${base}/${city}/profile/account`,
      languages: {
        ru: `${base}/${city}/profile/account`,
        uz: `${base}/uz/${city}/profile/account`,
        en: `${base}/en/${city}/profile/account`,
      },
    },
    robots: { index: false, follow: false },
  }
}

export default async function ProfileAccountPage({
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
        <div className="mt-8">
          <PersonalDataApp />
        </div>
      </div>
      <div className="md:hidden">
        <MobileProfileMenuApp />
      </div>
    </>
  )
}
