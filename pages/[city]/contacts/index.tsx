import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Contacts from '@components_new/contacts/Contacts'
import React from 'react'
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

export default function ContactsPage() {
  const { locale, query } = useRouter()
  return (
    <>
      <NextSeo
        title="Наши контакты"
        description="Контакты и график работы Chopar Pizza"
        canonical={`https://choparpizza.uz${locale === 'ru' ? '' : `/${locale}`}/${query.city || 'tashkent'}/contacts`}
        openGraph={{
          url: `https://choparpizza.uz${locale === 'ru' ? '' : `/${locale}`}/${query.city || 'tashkent'}/contacts`,
          locale: locale === 'uz' ? 'uz_UZ' : locale === 'en' ? 'en_US' : 'ru_UZ',
        }}
        languageAlternates={[
          { hrefLang: 'ru', href: `https://choparpizza.uz/${query.city || 'tashkent'}/contacts` },
          { hrefLang: 'uz', href: `https://choparpizza.uz/uz/${query.city || 'tashkent'}/contacts` },
          { hrefLang: 'en', href: `https://choparpizza.uz/en/${query.city || 'tashkent'}/contacts` },
        ]}
      />
      <Contacts />
    </>
  )
}

ContactsPage.Layout = Layout
