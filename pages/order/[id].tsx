import { Layout } from '@components/common'
import OrderAccept from '@components_new/order/OrderAccept'
import commerce from '@lib/api/commerce'
import cookies from 'next-cookies'
import axios from 'axios'
import { GetServerSidePropsContext } from 'next'
import getConfig from 'next/config'
import { ParsedUrlQuery } from 'querystring'

interface IParams extends ParsedUrlQuery {
  id: string
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

export async function getServerSideProps({
  preview,
  locale,
  locales,
  params,
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
  const { categories, brands, topMenu, footerInfoMenu, socials } =
    await siteInfoPromise

  const { id } = params as IParams

  const c = cookies(context)

  let otpToken: any = c['opt_token']

  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
  console.log(axios.defaults.headers.common)

  const { data: orderData } = await axios.get(
    `${webAddress}/api/orders?id=${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otpToken}`,
      },
      withCredentials: true,
    }
  )

  console.log(orderData)

  return {
    props: {
      products,
      categories,
      orderData,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
      cleanBackground: true,
    },
  }
}

export default function OrderId({ orderData }: { orderData: any }) {
  return (
    <div>
      <OrderAccept order={orderData} />
    </div>
  )
}

OrderId.Layout = Layout
