import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import About from '@components_new/about/About'
import Head from 'next/head'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      categories,
      brands,
      topMenu,
      currentCity,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>О компании Chopar Pizza</title>
        <meta property="og:title" content="О компании Chopar Pizza" />
        <meta name="og:description" content="История бренда Chopar Pizza" />
        <meta name="description" content="История бренда Chopar Pizza" />
      </Head>    
      <About />
    </>
  )
}

AboutPage.Layout = Layout
