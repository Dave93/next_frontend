import JsonLd from './JsonLd'
import { SEO_BASE_URL } from '@lib/seo/alternates'

const SOCIAL = [
  'https://www.instagram.com/choparpizza/',
  'https://www.facebook.com/choparpizza',
  'https://t.me/Chopar_bot',
]

export default function SiteJsonLd() {
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Chopar Pizza',
    url: SEO_BASE_URL,
    inLanguage: ['ru', 'uz', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_BASE_URL}/tashkent?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Chopar Pizza',
    legalName: 'Chopar Pizza',
    url: SEO_BASE_URL,
    logo: `${SEO_BASE_URL}/icon512x.png`,
    description:
      'Доставка пиццы с тандырным тестом в Узбекистане. Халяль. Бесплатная доставка.',
    foundingDate: '2014',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+998712051111',
        contactType: 'customer service',
        areaServed: 'UZ',
        availableLanguage: ['Russian', 'Uzbek', 'English'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UZ',
      addressLocality: 'Ташкент',
    },
    sameAs: SOCIAL,
  }

  return (
    <>
      <JsonLd data={website} />
      <JsonLd data={organization} />
    </>
  )
}
