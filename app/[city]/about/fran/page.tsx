import type { Metadata } from 'next'
import FranApp from '../../../../components_new/fran/FranApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Франшиза Chopar Pizza',
    description: 'Льготные условия франчайзинга — открой свою пиццерию Chopar',
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
