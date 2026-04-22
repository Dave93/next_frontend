import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { fetchPublicConfig } from '../../../lib/data/configs'
import ContactsApp from '../../../components_new/contacts/ContactsApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Наши контакты',
    description: 'Контакты и график работы Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/contacts`,
      languages: {
        ru: `${base}/${city}/contacts`,
        uz: `${base}/uz/${city}/contacts`,
        en: `${base}/en/${city}/contacts`,
      },
    },
  }
}

export default async function ContactsPage() {
  const [config, locale] = await Promise.all([
    fetchPublicConfig().catch(
      () => ({}) as Awaited<ReturnType<typeof fetchPublicConfig>>
    ),
    getLocale(),
  ])

  const workTime =
    locale === 'uz'
      ? config.workTimeUz
      : locale === 'en'
        ? config.workTimeEn
        : config.workTimeRu

  return <ContactsApp workTime={workTime} />
}
