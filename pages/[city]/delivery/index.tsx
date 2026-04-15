import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Delivery from '@components_new/delivery/Delivery'
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

export default function DeliveryPage() {
  const { locale, query } = useRouter()
  return (
    <>
      <NextSeo
        title="Доставка и оплата"
        description="Как сделать заказ, инструкция и дополнительная информация"
        canonical={`https://choparpizza.uz${locale === 'ru' ? '' : `/${locale}`}/${query.city || 'tashkent'}/delivery`}
        openGraph={{
          url: `https://choparpizza.uz${locale === 'ru' ? '' : `/${locale}`}/${query.city || 'tashkent'}/delivery`,
          locale: locale === 'uz' ? 'uz_UZ' : locale === 'en' ? 'en_US' : 'ru_UZ',
        }}
        languageAlternates={[
          { hrefLang: 'ru', href: `https://choparpizza.uz/${query.city || 'tashkent'}/delivery` },
          { hrefLang: 'uz', href: `https://choparpizza.uz/uz/${query.city || 'tashkent'}/delivery` },
          { hrefLang: 'en', href: `https://choparpizza.uz/en/${query.city || 'tashkent'}/delivery` },
        ]}
      />
      <Delivery />
    </>
  )
}

DeliveryPage.Layout = Layout
