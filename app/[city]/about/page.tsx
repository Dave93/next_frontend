import type { Metadata } from 'next'
import AboutApp from '../../../components_new/about/AboutApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'О компании Chopar Pizza',
    description: 'История бренда Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/about`,
      languages: {
        ru: `${base}/${city}/about`,
        uz: `${base}/uz/${city}/about`,
        en: `${base}/en/${city}/about`,
      },
    },
    openGraph: {
      url: `${base}/${city}/about`,
      type: 'website',
    },
  }
}

export default function AboutPage() {
  return <AboutApp />
}
