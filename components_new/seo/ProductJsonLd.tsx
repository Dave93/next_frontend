import type { FC } from 'react'
import JsonLd from './JsonLd'
import { SEO_BASE_URL } from '@lib/seo/alternates'

type Props = {
  product: any
  citySlug: string
  locale: string
}

function pickLocalized(map: any, locale: string) {
  if (!map) return ''
  const ch = map?.['chopar']
  if (!ch) return ''
  return ch[locale] || ch['ru'] || ''
}

function priceRange(product: any): { low: number; high: number; offerCount: number } {
  const variants: any[] = Array.isArray(product?.variants) ? product.variants : []
  if (variants.length) {
    const prices = variants
      .map((v) => Number(v?.price))
      .filter((n) => Number.isFinite(n) && n > 0)
    if (prices.length) {
      return {
        low: Math.min(...prices),
        high: Math.max(...prices),
        offerCount: prices.length,
      }
    }
  }
  const single = Number(product?.price) || 0
  return { low: single, high: single, offerCount: single ? 1 : 0 }
}

const ProductJsonLd: FC<Props> = ({ product, citySlug, locale }) => {
  if (!product) return null

  const name =
    pickLocalized(product?.attribute_data?.name, locale) ||
    product?.name ||
    'Chopar Pizza'
  const description = (
    pickLocalized(product?.attribute_data?.description, locale) ||
    product?.description ||
    ''
  )
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000)

  const productUrl =
    locale === 'ru'
      ? `${SEO_BASE_URL}/${citySlug}/product/${product.id}`
      : `${SEO_BASE_URL}/${locale}/${citySlug}/product/${product.id}`

  const images: string[] = []
  if (product?.image) images.push(String(product.image))

  const { low, high, offerCount } = priceRange(product)
  const oneYearAhead = new Date()
  oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1)
  const priceValidUntil = oneYearAhead.toISOString().slice(0, 10)

  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description || undefined,
    image: images.length ? images : undefined,
    sku: String(product?.id || ''),
    brand: { '@type': 'Brand', name: 'Chopar Pizza' },
    url: productUrl,
    category: 'Food/Pizza',
  }

  if (offerCount > 1) {
    data.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'UZS',
      lowPrice: low,
      highPrice: high,
      offerCount,
      availability: 'https://schema.org/InStock',
      url: productUrl,
      priceValidUntil,
    }
  } else if (offerCount === 1) {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: 'UZS',
      price: low,
      availability: 'https://schema.org/InStock',
      url: productUrl,
      priceValidUntil,
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'UZ',
        returnPolicyCategory:
          'https://schema.org/MerchantReturnNotPermitted',
      },
    }
  }

  return <JsonLd data={data} />
}

export default ProductJsonLd
