import JsonLd from './JsonLd'
import { SEO_BASE_URL } from '@lib/seo/alternates'

type Props = {
  citySlug: string
  locale: string
  categories: any[]
}

function pickLocalized(map: any, locale: string): string {
  if (!map) return ''
  const ch = map?.['chopar']
  if (!ch) return ''
  return ch[locale] || ch['ru'] || ''
}

export default function MenuJsonLd({ citySlug, locale, categories }: Props) {
  if (!Array.isArray(categories) || categories.length === 0) return null

  const sections = categories
    .filter(
      (cat: any) => Array.isArray(cat?.items) && cat.items.length > 0
    )
    .slice(0, 12)
    .map((cat: any) => {
      const sectionName =
        pickLocalized(cat?.attribute_data?.name, locale) || cat?.name || ''
      const items = (cat.items as any[]).slice(0, 30).map((item: any) => {
        const itemName =
          pickLocalized(item?.attribute_data?.name, locale) || item?.name || ''
        const itemDesc =
          pickLocalized(item?.attribute_data?.description, locale) ||
          item?.description ||
          ''
        const variants: any[] = Array.isArray(item?.variants)
          ? item.variants
          : []
        const prices = variants
          .map((v) => Number(v?.price))
          .filter((n) => Number.isFinite(n) && n > 0)
        const lowPrice = prices.length
          ? Math.min(...prices)
          : Number(item?.price) || 0

        const menuItem: Record<string, any> = {
          '@type': 'MenuItem',
          name: itemName,
          description:
            String(itemDesc)
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 600) || undefined,
          url: `${SEO_BASE_URL}${locale === 'ru' ? '' : `/${locale}`}/${citySlug}/product/${item.id}`,
        }
        if (item?.image) menuItem.image = item.image
        if (lowPrice > 0) {
          menuItem.offers = {
            '@type': 'Offer',
            price: lowPrice,
            priceCurrency: 'UZS',
            availability: 'https://schema.org/InStock',
          }
        }
        return menuItem
      })
      return {
        '@type': 'MenuSection',
        name: sectionName,
        hasMenuItem: items,
      }
    })

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Меню Chopar Pizza',
    inLanguage: locale,
    url: `${SEO_BASE_URL}${locale === 'ru' ? '' : `/${locale}`}/${citySlug}`,
    hasMenuSection: sections,
  }

  return <JsonLd data={data} />
}
