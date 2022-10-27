import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import axios from 'axios'
import { GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'
import getConfig from 'next/config'
import Link from 'next/link'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const { id } = query
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
  let orderData
  if (id) {
    const { data } = await axios.get(`${webAddress}/api/orders?id=${id}`)
    orderData = data
  }

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      currentCity,
      footerInfoMenu,
      socials,
      orderData,
      cities,
    },
  }
}

// const OrderWithNoSSR = dynamic(() => import('@components_new/order/Orders'), {
//   ssr: false,
// })

export default function Order({ orderData }: { orderData: any }) {
  return (
    <div>
      {orderData.id && (
        <div>
          <h1 className="mt-2 text-4xl">Заказ принят</h1>
          <div className="mt-2 font-semibold">
            Ваш заказ #{orderData.id} принят.
          </div>
          <div>
            Скоро с Вами свяжется наш менеджер для подтверждения заказа.
          </div>
          <div>
            Отслеживать заказ можете в{' '}
            <Link href="/profile/orders" prefetch={false}>
              <a className="text-yellow font-bold">профиле</a>
            </Link>
            .
          </div>
        </div>
      )}
    </div>
  )
}

Order.Layout = Layout
