import UserData from '@components_new/profile/UserData'
import React from 'react'
import { Layout } from '@components/common'
import { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import Orders from '@components_new/profile/Orders'
import cookies from 'next-cookies'
import axios from 'axios'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
  ...context
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products } = await productsPromise
  const { pages } = await pagesPromise
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
      products,
      categories,
      brands,
      pages,
      currentCity,
      topMenu,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

export default function OrdersPage({ orderData }: { orderData: any[] }) {
  return (
    <div>
      <UserData />
      <Orders />
    </div>
  )
}

OrdersPage.Layout = Layout
