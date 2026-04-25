import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import BranchApp from '../../../components_new/branch/BranchApp'
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
    title: tr('ourBranches', locale),
    description: tr('ourBranchesDesc', locale),
    alternates: {
      canonical: `${base}/${city}/branch`,
      languages: {
        ru: `${base}/${city}/branch`,
        uz: `${base}/uz/${city}/branch`,
        en: `${base}/en/${city}/branch`,
        'x-default': `${base}/${city}/branch`,
      },
    },
  }
}

export default async function BranchPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const loc = (await getLocale()) as 'ru' | 'uz' | 'en'
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: crumbLabel(loc, 'home'), url: localizedPath(loc, `/${citySlug}`) },
          {
            name: crumbLabel(loc, 'branch'),
            url: localizedPath(loc, `/${citySlug}/branch`),
          },
        ]}
      />
      <BranchApp />
    </>
  )
}
