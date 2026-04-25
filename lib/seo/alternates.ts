export const SEO_BASE_URL = 'https://choparpizza.uz'

export type SeoLocale = 'ru' | 'uz' | 'en'

export const SEO_LOCALES: SeoLocale[] = ['ru', 'uz', 'en']

export function localizedPath(locale: SeoLocale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === 'ru') return `${SEO_BASE_URL}${clean}`
  return `${SEO_BASE_URL}/${locale}${clean}`
}

export function buildLanguages(path: string) {
  const ru = localizedPath('ru', path)
  return {
    ru,
    uz: localizedPath('uz', path),
    en: localizedPath('en', path),
    'x-default': ru,
  }
}

export function buildAlternates(citySlug: string, suffix: string = '') {
  const path = `/${citySlug}${suffix}`
  return {
    canonical: localizedPath('ru', path),
    languages: buildLanguages(path),
  }
}
