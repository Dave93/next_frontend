import JsonLd from './JsonLd'
import { SEO_BASE_URL } from '@lib/seo/alternates'
import type { SlimMenu } from '../../lib/data/menu-dto'

type Props = {
  menu: SlimMenu
}

const MAX_SECTIONS = 12
const MAX_ITEMS_PER_SECTION = 30
const DESC_MAX = 300

export default function MenuJsonLd({ menu }: Props) {
  if (!menu.sections.length) return null

  const sections = menu.sections.slice(0, MAX_SECTIONS).map((sec) => {
    const items = sec.items.slice(0, MAX_ITEMS_PER_SECTION).map((item) => {
      const lowPrice = item.priceMin ?? item.price ?? 0
      const url = `${SEO_BASE_URL}${
        menu.locale === 'ru' ? '' : `/${menu.locale}`
      }/${menu.citySlug}/product/${item.id}`
      const desc =
        item.description && item.description.length > DESC_MAX
          ? item.description.slice(0, DESC_MAX - 1) + '…'
          : item.description
      const menuItem: Record<string, any> = {
        '@type': 'MenuItem',
        name: item.name,
        url,
      }
      if (desc) menuItem.description = desc
      if (item.image) menuItem.image = item.image
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
      name: sec.name,
      hasMenuItem: items,
    }
  })

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Меню Chopar Pizza',
    inLanguage: menu.locale,
    url: `${SEO_BASE_URL}${
      menu.locale === 'ru' ? '' : `/${menu.locale}`
    }/${menu.citySlug}`,
    hasMenuSection: sections,
  }

  return <JsonLd data={data} />
}
