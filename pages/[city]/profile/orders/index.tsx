import UserData from '@components_new/profile/UserData'
import React from 'react'
import { Layout } from '@components/common'
import { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import Orders from '@components_new/profile/Orders'
import cookies from 'next-cookies'
import axios from 'axios'
import { useRouter } from 'next/router'
import { ArrowLeftIcon } from '@heroicons/react/outline'

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const mobileLabels: Record<string, Record<string, string>> = {
  my_orders: { ru: 'Мои заказы', uz: 'Mening buyurtmalarim', en: 'My orders' },
}

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
            {mobileLabels.my_orders[locale] || 'Мои заказы'}
          </h1>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <UserData />
      </div>
      <Orders />
    </div>
  )
}

OrdersPage.Layout = Layout
