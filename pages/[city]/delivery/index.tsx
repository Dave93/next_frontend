import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Delivery from '@components_new/delivery/Delivery'
import React from 'react'
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

export default function DeliveryPage() {
  return (
    <>
      <Head>
        <title>Доставка и оплата</title>
        <meta property="og:title" content="Доставка и оплата" />
        <meta
          name="og:description"
          content="Как сделать заказ, инструкция и дополнительная информация"
        />
      </Head>
      <Delivery />
    </>
  )
}

DeliveryPage.Layout = Layout
