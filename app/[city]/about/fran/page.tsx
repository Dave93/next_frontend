import type { Metadata } from 'next'
import FranApp from '../../../../components_new/fran/FranApp'
import { staticPageAlternates } from '../../../../lib/seo/alternates'
import { getMetaLocale, tr } from '../../../../lib/seo/meta-i18n'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMetaLocale()
  return {
    title: tr('franchise', locale),
    description: tr('franchiseDesc', locale),
    alternates: staticPageAlternates('/about/fran'),
  }
}

export default function FranPage() {
  return <FranApp />
}
