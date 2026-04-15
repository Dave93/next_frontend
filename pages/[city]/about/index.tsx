import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import About from '@components_new/about/About'
import Head from 'next/head'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'

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
  const { locale, query } = useRouter()
  return (
    <>
      <NextSeo
        title="О компании Chopar Pizza"
        description="История бренда Chopar Pizza"
        canonical={`https://choparpizza.uz${locale === 'ru' ? '' : `/${locale}`}/${query.city || 'tashkent'}/about`}
        openGraph={{
          url: `https://choparpizza.uz${locale === 'ru' ? '' : `/${locale}`}/${query.city || 'tashkent'}/about`,
          locale: locale === 'uz' ? 'uz_UZ' : locale === 'en' ? 'en_US' : 'ru_UZ',
        }}
        languageAlternates={[
          { hrefLang: 'ru', href: `https://choparpizza.uz/${query.city || 'tashkent'}/about` },
          { hrefLang: 'uz', href: `https://choparpizza.uz/uz/${query.city || 'tashkent'}/about` },
          { hrefLang: 'en', href: `https://choparpizza.uz/en/${query.city || 'tashkent'}/about` },
        ]}
      />
      <About />
    </>
  )
}

AboutPage.Layout = Layout
