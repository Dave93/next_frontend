import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import axios from 'axios'
import { GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'
import { CheckCircleIcon } from '@heroicons/react/solid'

let webAddress = process.env.NEXT_PUBLIC_API_URL
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

const labels: Record<string, Record<string, string>> = {
  accepted: { ru: 'Заказ принят!', uz: 'Buyurtma qabul qilindi!', en: 'Order accepted!' },
  your_order: { ru: 'Ваш заказ', uz: 'Sizning buyurtmangiz', en: 'Your order' },
  accepted_short: { ru: 'принят', uz: 'qabul qilindi', en: 'accepted' },
  manager_call: {
    ru: 'Скоро с Вами свяжется наш менеджер для подтверждения заказа.',
    uz: 'Tez orada menejerimiz buyurtmani tasdiqlash uchun siz bilan bog\'lanadi.',
    en: 'Our manager will contact you shortly to confirm your order.',
  },
  track_in: { ru: 'Отслеживать заказ можете в', uz: 'Buyurtmani kuzatishingiz mumkin', en: 'Track your order in' },
  my_orders: { ru: 'моих заказах', uz: 'mening buyurtmalarimda', en: 'my orders' },
  to_main: { ru: 'На главную', uz: 'Bosh sahifaga', en: 'To main' },
}

export default function Order({ orderData }: { orderData: any }) {
  const router = useRouter()
  const { locale = 'ru', query } = router
  const { activeCity } = useUI()
  const citySlug = (query.city as string) || activeCity?.slug || ''
  const t = (key: string) => labels[key]?.[locale] || labels[key]?.ru || key

  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block">
        {orderData?.id && (
          <div>
            <h1 className="mt-2 text-4xl">{t('accepted')}</h1>
            <div className="mt-2 font-semibold">
              {t('your_order')} #{orderData.id} {t('accepted_short')}.
            </div>
            <div>{t('manager_call')}</div>
            <div>
              {t('track_in')}{' '}
              <Link href={`/${citySlug}/profile/orders`} prefetch={false} legacyBehavior>
                <a className="text-yellow font-bold">{t('my_orders')}</a>
              </Link>
              .
            </div>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col items-center justify-center min-h-[70vh] px-6 pb-20">
        {orderData?.id ? (
          <>
            <CheckCircleIcon className="w-20 h-20 mb-4" style={{ color: '#F9B004' }} />
            <h1 className="text-2xl font-bold text-center mb-2">
              {t('accepted')}
            </h1>
            <p className="text-gray-500 text-center text-sm mb-1">
              {t('your_order')} <span className="font-semibold text-gray-900">#{orderData.id}</span>
            </p>
            <p className="text-gray-500 text-center text-sm mb-6">
              {t('manager_call')}
            </p>
            <Link
              href={`/${citySlug}/profile/orders`}
              prefetch={false}
              className="w-full py-3 rounded-full text-center text-white font-semibold text-base mb-3"
              style={{ backgroundColor: '#F9B004' }}
            >
              {t('my_orders')}
            </Link>
            <button
              onClick={() => router.push(`/${citySlug}`)}
              className="w-full py-3 rounded-full text-center text-gray-700 font-semibold text-base bg-gray-100"
            >
              {t('to_main')}
            </button>
          </>
        ) : (
          <p className="text-gray-400">{t('accepted')}</p>
        )}
      </div>
    </div>
  )
}

Order.Layout = Layout
