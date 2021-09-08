import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'

export async function getServerSideProps({
  preview,
  locale,
  locales,
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { categories, brands, topMenu, footerInfoMenu, socials, cities } =
    await siteInfoPromise

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      cleanBackground: true,
      cities,
    },
  }
}

export default function Sale() {
  return (
    <>
      <h1>Sale</h1>
    </>
  )
}

Sale.Layout = Layout
