import type { Metadata } from 'next'
import PrivacyApp from '../../../components_new/privacy/PrivacyApp'
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
    title: tr('privacy', locale),
    description: tr('privacyDesc', locale),
    alternates: {
      canonical: `${base}/${city}/privacy`,
      languages: {
        ru: `${base}/${city}/privacy`,
        uz: `${base}/uz/${city}/privacy`,
        en: `${base}/en/${city}/privacy`,
        'x-default': `${base}/${city}/privacy`,
      },
    },
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function PrivacyPage() {
  return <PrivacyApp />
}
