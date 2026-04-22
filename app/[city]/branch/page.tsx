import type { Metadata } from 'next'
import BranchApp from '../../../components_new/branch/BranchApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Наши филиалы Chopar Pizza',
    description: 'Адреса пиццерий Chopar Pizza с режимом работы и картой',
    alternates: {
      canonical: `${base}/${city}/branch`,
      languages: {
        ru: `${base}/${city}/branch`,
        uz: `${base}/uz/${city}/branch`,
        en: `${base}/en/${city}/branch`,
      },
    },
  }
}

export default function BranchPage() {
  return <BranchApp />
}
