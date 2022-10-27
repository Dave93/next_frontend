import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Delivery from '@components_new/delivery/Delivery'
import React from 'react'
import Head from 'next/head'
import { NextSeo } from 'next-seo'

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
      <NextSeo
        title="Доставка и оплата"
        description="Как сделать заказ, инструкция и дополнительная информация"
      />
      <Delivery />
    </>
  )
}

DeliveryPage.Layout = Layout
