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
  ...context
}: GetServerSidePropsContext) {
  const config = { locale, locales }
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
  const { categories, brands, topMenu, footerInfoMenu, socials, cities } =
    await siteInfoPromise

  const c = cookies(context)
  let otpToken: any = c['opt_token']
  c['user_token'] = otpToken
  axios.defaults.headers.get.Cookie = c
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

  let orderData = []
  console.log(otpToken)
  try {
    const { data } = await axios.get(`${webAddress}/api/my-orders`, {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    })
    orderData = data.data
  } catch (e) {}

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      orderData,
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
      <Orders orders={orderData} />
    </div>
  )
}

OrdersPage.Layout = Layout
