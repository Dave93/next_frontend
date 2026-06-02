import type { Metadata } from 'next'
import PrivacyApp from '../../../components_new/privacy/PrivacyApp'
import { staticPageAlternates } from '../../../lib/seo/alternates'
import { getMetaLocale, tr } from '../../../lib/seo/meta-i18n'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMetaLocale()
  return {
    title: tr('privacy', locale),
    description: tr('privacyDesc', locale),
    alternates: staticPageAlternates('/privacy'),
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function PrivacyPage() {
  return <PrivacyApp />
}
