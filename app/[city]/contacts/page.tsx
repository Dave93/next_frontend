import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { storefrontConfig } from '../../../lib/data/storefront-config'
import ContactsApp from '../../../components_new/contacts/ContactsApp'
import BreadcrumbsJsonLd from '../../../components_new/seo/BreadcrumbsJsonLd'
import {
  crumbLabel,
  localizedPath,
  staticPageAlternates,
} from '../../../lib/seo/alternates'
import { getMetaLocale, tr } from '../../../lib/seo/meta-i18n'

type Params = { city: string }

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMetaLocale()
  return {
    title: tr('contacts', locale),
    description: tr('contactsDesc', locale),
    alternates: staticPageAlternates('/contacts'),
  }
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const locale = await getLocale()
  const config = storefrontConfig

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
