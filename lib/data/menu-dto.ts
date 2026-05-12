import 'server-only'

export type SlimModifier = {
  id: number
  name: string
  price: number
  weight?: number
  image?: string
  groupId?: string
}

export type SlimModifierProduct = {
  id: number
  /** Absolute price of the modifier product — useProductBuilder subtracts
   *  the variant's own price to get the delta shown to the user. */
  price: number
  name_ru?: string
  name_uz?: string
  name_en?: string
  image?: string
}

export type SlimVariant = {
  id: number
  name: string
  description?: string
  price: number
  weight?: number
  modifiers?: SlimModifier[]
  /** «Сосисочный борт» / любой modifier-as-product, см. ProductsController
   *  createCacheProducts(): products[i].modifierProduct = products[modifier_prod_id].
   *  Без этого поля drawer/inline-карточка не подмешивают sausage-плитку. */
  modifierProduct?: SlimModifierProduct
}

export type SlimProduct = {
  id: number
  name: string
  description?: string
  image?: string
  price?: number
  priceMin?: number
  priceMax?: number
  weight?: number
  variants?: SlimVariant[]
  modifiers?: SlimModifier[]
  hasModifiers: boolean
  threesome?: boolean
}

export type SlimSection = {
  id: number
  name: string
  description?: string
  icon?: string
  halfMode: boolean
  threeSale: boolean
  items: SlimProduct[]
}

export type SlimMenu = {
  citySlug: string
  locale: string
  sections: SlimSection[]
  generatedAt: string
}

type Locale = 'ru' | 'uz' | 'en' | string

function pickLocalized(map: any, locale: Locale): string {
  if (!map || typeof map !== 'object') return ''
  const channel = map.chopar
  if (channel && typeof channel === 'object') {
    return channel[locale] || channel.ru || channel.en || ''
  }
  return map[locale] || map.ru || map.en || ''
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).trimEnd() + '…'
}

function localizedDescription(attr: any, locale: Locale): string | undefined {
  const raw = pickLocalized(attr?.description, locale)
  if (!raw) return undefined
  const plain = truncate(stripHtml(raw), 200)
  return plain || undefined
}

function num(v: any): number | undefined {
  const n = typeof v === 'string' ? parseFloat(v) : v
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return undefined
  return n
}

function modifierName(raw: any, locale: Locale): string {
  if (locale === 'uz') return raw.name_uz || raw.name || ''
  if (locale === 'en') return raw.name_en || raw.name || ''
  return raw.name || ''
}

function modifierImage(raw: any): string | undefined {
  const asset = Array.isArray(raw.assets) ? raw.assets[0] : null
  if (!asset?.location || !asset?.filename) return undefined
  return `https://cdn.choparpizza.uz/storage/${asset.location}/${asset.filename}`
}

function toSlimModifier(raw: any, locale: Locale): SlimModifier {
  return {
    id: raw.id,
    name: modifierName(raw, locale),
    price: num(raw.price) || 0,
    weight: num(raw.weight),
    image: modifierImage(raw),
    groupId: typeof raw.groupId === 'string' ? raw.groupId : undefined,
  }
}

function variantSizeLabel(raw: any, locale: Locale): string {
  // Variant labels are the size: "25 см" / "30 см" / "40 см".
  // Prefer the per-locale custom_name_* fields (which hold ONLY the size),
  // not attribute_data.name (which on some products embeds the full pizza
  // name like "ПЕППЕРОНИ 25 см" — that duplicates the product title).
  if (locale === 'uz' && raw.custom_name_uz) return raw.custom_name_uz
  if (locale === 'en' && raw.custom_name_en) return raw.custom_name_en
  return raw.custom_name || raw.custom_name_uz || raw.custom_name_en || ''
}

function toSlimModifierProduct(raw: any): SlimModifierProduct | undefined {
  if (!raw || typeof raw !== 'object' || !raw.id) return undefined
  const price = num(raw.price)
  if (price === undefined) return undefined
  const asset = Array.isArray(raw.assets) ? raw.assets[0] : null
  const image =
    asset?.local ||
    (asset?.location && asset?.filename
      ? `https://cdn.choparpizza.uz/storage/${asset.location}/${asset.filename}`
      : undefined)
  // Names intentionally not pulled from raw.attribute_data — that map holds
  // the FULL pizza-with-rim title ("ГРИБНАЯ Средняя+ СОСИСОЧНЫЙ БОРТ") which
  // is wrong for a 56×56 modifier tile. Consumers fall back to a hardcoded
  // short «Сосисочный борт» label.
  return {
    id: raw.id,
    price,
    name_ru: raw.name_ru || undefined,
    name_uz: raw.name_uz || undefined,
    name_en: raw.name_en || undefined,
    image,
  }
}

function toSlimVariant(raw: any, locale: Locale): SlimVariant {
  const mods: SlimModifier[] = Array.isArray(raw.modifiers)
    ? raw.modifiers.map((m: any) => toSlimModifier(m, locale))
    : []
  return {
    id: raw.id,
    name:
      variantSizeLabel(raw, locale) ||
      pickLocalized(raw.attribute_data?.name, locale) ||
      '',
    description: localizedDescription(raw.attribute_data, locale),
    price: num(raw.price) || 0,
    weight: num(raw.weight),
    modifiers: mods.length ? mods : undefined,
    modifierProduct: toSlimModifierProduct(raw.modifierProduct),
  }
}

function toSlimProduct(raw: any, locale: Locale): SlimProduct {
  const variants: SlimVariant[] = Array.isArray(raw.variants)
    ? raw.variants.map((v: any) => toSlimVariant(v, locale))
    : []
  const modifiers: SlimModifier[] = Array.isArray(raw.modifiers)
    ? raw.modifiers.map((m: any) => toSlimModifier(m, locale))
    : []

  let priceMin: number | undefined
  let priceMax: number | undefined
  let basePrice: number | undefined

  if (variants.length) {
    const prices = variants
      .map((v) => v.price)
      .filter((p) => Number.isFinite(p) && p > 0)
    if (prices.length) {
      priceMin = Math.min(...prices)
      priceMax = Math.max(...prices)
    }
  } else {
    basePrice = num(raw.price)
  }

  const hasMods =
    modifiers.length > 0 ||
    variants.some((v) => Array.isArray(v.modifiers) && v.modifiers.length > 0)

  return {
    id: raw.id,
    name:
      pickLocalized(raw.attribute_data?.name, locale) ||
      raw.custom_name ||
      '',
    description: localizedDescription(raw.attribute_data, locale),
    image: typeof raw.image === 'string' && raw.image ? raw.image : undefined,
    price: basePrice,
    priceMin,
    priceMax,
    weight: num(raw.weight),
    variants: variants.length ? variants : undefined,
    modifiers: modifiers.length ? modifiers : undefined,
    hasModifiers: hasMods,
    threesome: raw.threesome ? true : undefined,
  }
}

function sectionDescription(raw: any, locale: Locale): string | undefined {
  if (locale === 'uz') return raw.desc_uz || undefined
  if (locale === 'en') return raw.desc_en || raw.desc || undefined
  return raw.desc || undefined
}

function toSlimSection(raw: any, locale: Locale): SlimSection {
  return {
    id: raw.id,
    name: pickLocalized(raw.attribute_data?.name, locale),
    description: sectionDescription(raw, locale),
    icon: typeof raw.icon === 'string' ? raw.icon : undefined,
    halfMode: !!raw.half_mode,
    threeSale: !!raw.three_sale,
    items: (Array.isArray(raw.items) ? raw.items : [])
      .filter((item: any) => item && item.active !== 0)
      .map((item: any) => toSlimProduct(item, locale)),
  }
}

export function toSlimMenu(
  raw: any[],
  citySlug: string,
  locale: Locale
): SlimMenu {
  const sections = (Array.isArray(raw) ? raw : [])
    .filter(
      (s: any) =>
        s &&
        s.active !== 0 &&
        Array.isArray(s.items) &&
        s.items.length > 0
    )
    .map((s: any) => toSlimSection(s, locale))
    .filter((s) => s.items.length > 0)

  return {
    citySlug,
    locale,
    sections,
    generatedAt: new Date().toISOString(),
  }
}
