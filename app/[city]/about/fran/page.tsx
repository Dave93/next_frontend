import type { Metadata } from 'next'
import FranApp from '../../../../components_new/fran/FranApp'
import { getMetaLocale, tr } from '../../../../lib/seo/meta-i18n'

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
    title: tr('franchise', locale),
    description: tr('franchiseDesc', locale),
    alternates: {
      canonical: `${base}/${city}/about/fran`,
      languages: {
        ru: `${base}/${city}/about/fran`,
        uz: `${base}/uz/${city}/about/fran`,
        en: `${base}/en/${city}/about/fran`,
        'x-default': `${base}/${city}/about/fran`,
      },
    },
  }
}

export default function FranPage() {
  return <FranApp />
}
