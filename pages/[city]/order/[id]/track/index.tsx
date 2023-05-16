import { Layout } from '@components/common'
import OrderAccept from '@components_new/order/OrderAccept'
import commerce from '@lib/api/commerce'
import cookies from 'next-cookies'
import axios from 'axios'
import { GetServerSidePropsContext } from 'next'
import getConfig from 'next/config'
import { ParsedUrlQuery } from 'querystring'
import OrderTracking from '@components_new/order/OrderTracking'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'

interface IParams extends ParsedUrlQuery {
  id: string
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

export async function getServerSideProps({
  preview,
  locale,
  locales,
  params,
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
  const { categories, brands, topMenu, footerInfoMenu, socials, currentCity } =
    await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  const { id } = params as IParams

  const c = cookies(context)

  let otpToken: any = c['opt_token']
  c['user_token'] = otpToken
  axios.defaults.headers.get.Cookie = c
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
  // console.log(axios.defaults.headers.common)

  let orderData = {}

  try {
    const { data } = await axios.get(`${webAddress}/api/orders?id=${id}`, {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    })
    orderData = data
  } catch (e) {}
  const { data: orderStatuses } = await axios.get(
    `${webAddress}/api/order_statuses/system`
  )

  return {
    props: {
      products,
      categories,
      orderData: orderData ?? {},
      orderStatuses: orderStatuses.data ? orderStatuses.data : {},
      brands,
      pages,
      currentCity,
      topMenu,
      footerInfoMenu,
      socials,
    },
  }
}

export default function OrderId({
  orderData,
  orderStatuses,
}: {
  orderData: any
  orderStatuses: any
}) {
  const { t: tr } = useTranslation('common')
  const { user, activeCity, openSignInModal } = useUI()
  return (
    <div>
      {orderData && orderData.id && <OrderTracking orderId={orderData.id} />}
      {!user && (
        <div className="text-center mt-10">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative"
            role="alert"
          >
            <strong className="font-bold">{tr('error_label')}: </strong>
            <span className="block sm:inline">{tr('user_not_signed')}</span>
          </div>
          <button
            className="text-xl text-white bg-yellow rounded-2xl mt-10 md:w-max m-auto py-3 px-16 cursor-pointer text-center mx-5 md:mx-auto"
            onClick={() => openSignInModal()}
          >
            <div>{tr('signIn')}</div>
          </button>
        </div>
      )}
      {user && !orderData.id && (
        <div className="text-center mt-10">
          <h1 className="text-3xl font-bold">{tr('order_not_found')}</h1>
        </div>
      )}
    </div>
  )
}

OrderId.Layout = Layout
