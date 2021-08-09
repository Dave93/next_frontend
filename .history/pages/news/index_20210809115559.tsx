import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import NewsList from "@components_new/news/NewsList"

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
      cleanBackground: true,
    },
  }
}

export default function News() {
  return (
    <>
      <NewsList />
    </>
  )
}

News.Layout = Layout
