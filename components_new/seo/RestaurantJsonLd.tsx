import { SEO_BASE_URL } from '@lib/seo/alternates'
import JsonLd from './JsonLd'

const SOCIAL = [
  'https://www.instagram.com/choparpizza/',
  'https://www.facebook.com/choparpizza',
  'https://t.me/Chopar_bot',
]

export default function RestaurantJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Chopar Pizza',
    description:
      'Доставка пиццы с тандырным тестом в Ташкенте. Халяль. Бесплатная доставка.',
    url: SEO_BASE_URL,
    telephone: '+998712051111',
    servesCuisine: ['Pizza', 'Italian', 'Uzbek'],
    priceRange: '$$',
    paymentAccepted: ['Cash', 'Credit Card', 'Uzcard', 'Humo', 'Visa', 'MasterCard'],
    currenciesAccepted: 'UZS',
    acceptsReservations: false,
    image: `${SEO_BASE_URL}/icon512x.png`,
    logo: `${SEO_BASE_URL}/icon512x.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ташкент',
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.2995,
      longitude: 69.2401,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '10:00',
      closes: '03:00',
    },
    sameAs: SOCIAL,
    hasMenu: `${SEO_BASE_URL}/tashkent`,
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_BASE_URL}/tashkent/cart`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModeOwnFleet'],
    },
  }

  return <JsonLd data={data} />
}
