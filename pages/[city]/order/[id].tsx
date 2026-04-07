import { Layout } from '@components/common'
import OrderAccept from '@components_new/order/OrderAccept'
import commerce from '@lib/api/commerce'
import cookies from 'next-cookies'
import axios from 'axios'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useRouter } from 'next/router'
import { ArrowLeftIcon } from '@heroicons/react/outline'

interface IParams extends ParsedUrlQuery {
  id: string
}

let webAddress = process.env.NEXT_PUBLIC_API_URL
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

  const { data: orderData } = await axios.get(
    `${webAddress}/api/orders?id=${id}`,
    {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    }
  )
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
      cleanBackground: true,
    },
  }
}

const mobileLabels: Record<string, Record<string, string>> = {
  order_detail: { ru: 'Детали заказа', uz: 'Buyurtma tafsilotlari', en: 'Order details' },
}

export default function OrderId({
  orderData,
  orderStatuses,
}: {
  orderData: any
  orderStatuses: any
}) {
  const router = useRouter()
  const { locale = 'ru' } = router

  return (
    <div>
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center -ml-1"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-900 pr-8">
            {mobileLabels.order_detail[locale] || 'Детали заказа'}
          </h1>
        </div>
      </div>
      <OrderAccept order={orderData} orderStatuses={orderStatuses} />
    </div>
  )
}

OrderId.Layout = Layout
