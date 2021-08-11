import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Contacts from '@components_new/contacts/Contacts'

export async function getServerSideProps({
  preview,
  locale,
  locales,
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { categories, brands, topMenu, footerInfoMenu, socials } =
    await siteInfoPromise

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
    },
  }
}

export default function ContactsPage() {
  return (
    <>
      <Contacts />
    </>
  )
}

ContactsPage.Layout = Layout
