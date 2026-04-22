import type { Metadata } from 'next'
import PrivacyApp from '../../../components_new/privacy/PrivacyApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Политика конфиденциальности',
    description: 'Политика конфиденциальности Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/privacy`,
      languages: {
        ru: `${base}/${city}/privacy`,
        uz: `${base}/uz/${city}/privacy`,
        en: `${base}/en/${city}/privacy`,
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
