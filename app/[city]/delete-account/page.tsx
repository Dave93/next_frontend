import type { Metadata } from 'next'
import DeleteAccountApp from '../../../components_new/deleteAccount/DeleteAccountApp'
import { staticPageAlternates } from '../../../lib/seo/alternates'
import { getMetaLocale, tr } from '../../../lib/seo/meta-i18n'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMetaLocale()
  return {
    title: tr('deleteAccount', locale),
    description: tr('deleteAccountDesc', locale),
    alternates: staticPageAlternates('/delete-account'),
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function DeleteAccountPage() {
  return <DeleteAccountApp />
}
