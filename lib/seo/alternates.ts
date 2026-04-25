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

const RU_LABELS = {
  home: 'Главная',
  news: 'Новости',
  sale: 'Акции',
  about: 'О компании',
  contacts: 'Контакты',
  delivery: 'Доставка и оплата',
  branch: 'Адреса ресторанов',
  privacy: 'Конфиденциальность',
}
const UZ_LABELS = {
  home: 'Bosh sahifa',
  news: 'Yangiliklar',
  sale: 'Aksiyalar',
  about: 'Biz haqimizda',
  contacts: 'Kontaktlar',
  delivery: "Yetkazib berish va to'lov",
  branch: 'Restoran manzillari',
  privacy: 'Maxfiylik',
}
const EN_LABELS = {
  home: 'Home',
  news: 'News',
  sale: 'Promotions',
  about: 'About',
  contacts: 'Contacts',
  delivery: 'Delivery and payment',
  branch: 'Restaurant addresses',
  privacy: 'Privacy',
}

export type CrumbKey = keyof typeof RU_LABELS

export function crumbLabel(locale: string, key: CrumbKey): string {
  if (locale === 'uz') return UZ_LABELS[key]
  if (locale === 'en') return EN_LABELS[key]
  return RU_LABELS[key]
}
