import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../data/site-info'
import type { City } from '@commerce/types/cities'

export type Lang = 'ru' | 'uz' | 'en'

export async function getMetaLocale(): Promise<Lang> {
  const l = await getLocale()
  return (['ru', 'uz', 'en'].includes(l) ? l : 'ru') as Lang
}

const inLocative: Record<string, Record<Lang, string>> = {
  tashkent: { ru: 'в Ташкенте', uz: 'Toshkentda', en: 'in Tashkent' },
  samarkand: { ru: 'в Самарканде', uz: 'Samarqandda', en: 'in Samarkand' },
  bukhara: { ru: 'в Бухаре', uz: 'Buxoroda', en: 'in Bukhara' },
  namangan: { ru: 'в Намангане', uz: 'Namanganda', en: 'in Namangan' },
  fergana: { ru: 'в Фергане', uz: "Farg'onada", en: 'in Fergana' },
  andijan: { ru: 'в Андижане', uz: 'Andijonda', en: 'in Andijan' },
  qarshi: { ru: 'в Карши', uz: 'Qarshida', en: 'in Karshi' },
  nukus: { ru: 'в Нукусе', uz: 'Nukusda', en: 'in Nukus' },
  urgench: { ru: 'в Ургенче', uz: 'Urganchda', en: 'in Urgench' },
  jizzakh: { ru: 'в Джизаке', uz: 'Jizzaxda', en: 'in Jizzakh' },
  gulistan: { ru: 'в Гулистане', uz: 'Gulistonda', en: 'in Gulistan' },
  termez: { ru: 'в Термезе', uz: 'Termizda', en: 'in Termez' },
  chirchiq: { ru: 'в Чирчике', uz: 'Chirchiqda', en: 'in Chirchik' },
  navoi: { ru: 'в Навои', uz: 'Navoiyda', en: 'in Navoi' },
}

export function cityNameInLocative(slug: string, locale: Lang): string {
  const map = inLocative[slug]
  if (map) return map[locale]
  return locale === 'ru' ? `в ${slug}` : locale === 'uz' ? `${slug}da` : `in ${slug}`
}

export async function cityName(slug: string, locale?: Lang): Promise<string> {
  const lang = locale ?? (await getMetaLocale())
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  const city = cities?.find((c) => c.slug === slug)
  if (!city) return slug
  if (lang === 'uz') return city.name_uz || city.name
  if (lang === 'en') return city.name_en || city.name
  return city.name
}

type Dict = Record<Lang, string>

export const t = {
  // Common
  cart: { ru: 'Корзина', uz: 'Savat', en: 'Cart' } as Dict,
  myProfile: { ru: 'Мой профиль', uz: 'Mening profilim', en: 'My Profile' } as Dict,
  myOrders: { ru: 'Мои заказы', uz: 'Mening buyurtmalarim', en: 'My Orders' } as Dict,
  personalData: { ru: 'Личные данные', uz: "Shaxsiy ma'lumotlar", en: 'Personal Data' } as Dict,
  myAddresses: { ru: 'Мои адреса', uz: 'Mening manzillarim', en: 'My Addresses' } as Dict,
  checkout: { ru: 'Оформление заказа', uz: 'Buyurtmani rasmiylashtirish', en: 'Checkout' } as Dict,
  orderPlaced: { ru: 'Заказ оформлен', uz: 'Buyurtma rasmiylashtirildi', en: 'Order Placed' } as Dict,
  orderNumber: { ru: 'Заказ', uz: 'Buyurtma', en: 'Order' } as Dict,
  orderTracking: { ru: 'Отслеживание заказа', uz: 'Buyurtmani kuzatish', en: 'Order Tracking' } as Dict,
  bonuses: { ru: 'Бонусы', uz: 'Bonuslar', en: 'Bonuses' } as Dict,
  startBonus: {
    ru: 'Начать бонусную программу',
    uz: 'Bonus dasturini boshlash',
    en: 'Start Bonus Program',
  } as Dict,
  franchise: { ru: 'Франшиза', uz: 'Franshiza', en: 'Franchise' } as Dict,
  franchiseDesc: {
    ru: 'Льготные условия франчайзинга — открой свою пиццерию Chopar',
    uz: "Imtiyozli franshiza shartlari — o'zingizning Chopar pitsseriyangizni oching",
    en: 'Favorable franchise terms — open your own Chopar pizzeria',
  } as Dict,
  deliveryAndPayment: {
    ru: 'Доставка и оплата',
    uz: "Yetkazib berish va to'lov",
    en: 'Delivery & Payment',
  } as Dict,
  deliveryAndPaymentDesc: {
    ru: 'Как сделать заказ, инструкция и дополнительная информация',
    uz: "Buyurtma berish, ko'rsatma va qo'shimcha ma'lumotlar",
    en: 'How to place an order, instructions and additional information',
  } as Dict,
  ourBranches: { ru: 'Наши филиалы', uz: 'Bizning filiallar', en: 'Our Branches' } as Dict,
  ourBranchesDesc: {
    ru: 'Адреса пиццерий Chopar Pizza с режимом работы и картой',
    uz: "Chopar Pizza pitsseriyalari manzillari, ish vaqti va xarita",
    en: 'Chopar Pizza locations with hours and map',
  } as Dict,
  privacy: {
    ru: 'Политика конфиденциальности',
    uz: 'Maxfiylik siyosati',
    en: 'Privacy Policy',
  } as Dict,
  privacyDesc: {
    ru: 'Политика конфиденциальности Chopar Pizza',
    uz: 'Chopar Pizza maxfiylik siyosati',
    en: 'Chopar Pizza privacy policy',
  } as Dict,
  contacts: { ru: 'Наши контакты', uz: 'Bizning kontaktlar', en: 'Our Contacts' } as Dict,
  contactsDesc: {
    ru: 'Контакты и график работы Chopar Pizza',
    uz: 'Chopar Pizza kontaktlari va ish vaqti',
    en: 'Chopar Pizza contacts and working hours',
  } as Dict,
  about: { ru: 'О компании', uz: 'Kompaniya haqida', en: 'About Us' } as Dict,
  aboutDesc: {
    ru: 'История бренда Chopar Pizza',
    uz: 'Chopar Pizza brendi tarixi',
    en: 'Chopar Pizza brand story',
  } as Dict,
  news: { ru: 'Новости', uz: 'Yangiliklar', en: 'News' } as Dict,
  newsDesc: {
    ru: 'Свежие новости и события Chopar Pizza',
    uz: 'Chopar Pizza yangi xabarlari va voqealari',
    en: 'Fresh Chopar Pizza news and events',
  } as Dict,
  sales: { ru: 'Акции', uz: 'Aksiyalar', en: 'Promotions' } as Dict,
  salesDesc: {
    ru: 'Акции и специальные предложения Chopar Pizza — скидки на пиццу, сеты и доставку',
    uz: "Chopar Pizza aksiyalari va maxsus takliflar — pitsa, setlar va yetkazib berishda chegirmalar",
    en: 'Chopar Pizza promotions and special offers — discounts on pizza, sets and delivery',
  } as Dict,
  // Home
  homeTitle: {
    ru: 'Заказать пиццу с доставкой {city}',
    uz: '{city} pitsa yetkazib berish bilan buyurtma qiling',
    en: 'Order pizza with delivery {city}',
  } as Dict,
  homeDesc: {
    ru: 'Бесплатная доставка пиццы {city}, заказать можно на нашем сайте или через телеграм бот @Chopar_bot',
    uz: '{city} bepul pitsa yetkazib berish, buyurtma berish saytimiz yoki @Chopar_bot telegram boti orqali mumkin',
    en: 'Free pizza delivery {city}, order on our website or via @Chopar_bot Telegram bot',
  } as Dict,
}

export function tr(key: keyof typeof t, locale: Lang, vars?: Record<string, string>): string {
  let str = t[key][locale] || t[key].ru
  if (vars) for (const k in vars) str = str.replaceAll(`{${k}}`, vars[k])
  return str
}
