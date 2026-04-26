type Locale = 'ru' | 'uz' | 'en' | string

export function formatPrice(value: number, locale: Locale): string {
  const formatted = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const suffix =
    locale === 'uz' ? "so'm" : locale === 'en' ? 'sum' : 'сум'
  return `${formatted} ${suffix}`
}

export function formatPriceRange(
  min: number | undefined,
  max: number | undefined,
  base: number | undefined,
  locale: Locale
): string {
  if (typeof min === 'number' && typeof max === 'number' && min !== max) {
    return `${formatPrice(min, locale)}`
  }
  const v = base ?? min ?? max
  if (typeof v === 'number') return formatPrice(v, locale)
  return ''
}
