import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { fetchPublicConfig } from '../../../lib/data/configs'
import ContactsApp from '../../../components_new/contacts/ContactsApp'
import BreadcrumbsJsonLd from '../../../components_new/seo/BreadcrumbsJsonLd'
import { crumbLabel, localizedPath } from '../../../lib/seo/alternates'
import { getMetaLocale, tr } from '../../../lib/seo/meta-i18n'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  const locale = await getMetaLocale()
  return {
    title: tr('contacts', locale),
    description: tr('contactsDesc', locale),
    alternates: {
      canonical: `${base}/${city}/contacts`,
      languages: {
        ru: `${base}/${city}/contacts`,
        uz: `${base}/uz/${city}/contacts`,
        en: `${base}/en/${city}/contacts`,
        'x-default': `${base}/${city}/contacts`,
      },
    },
  }
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
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

  const loc = locale as 'ru' | 'uz' | 'en'
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: crumbLabel(loc, 'home'), url: localizedPath(loc, `/${citySlug}`) },
          {
            name: crumbLabel(loc, 'contacts'),
            url: localizedPath(loc, `/${citySlug}/contacts`),
          },
        ]}
      />
      <ContactsApp workTime={workTime} />
    </>
  )
}
