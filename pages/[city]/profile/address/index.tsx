import type { GetServerSidePropsContext } from 'next'
import useCustomer from '@framework/customer/use-customer'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import React from 'react'
import { useRouter } from 'next/router'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import UserData from '@components_new/profile/UserData'
import Address from '@components_new/profile/Address'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
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
      topMenu,
      currentCity,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

const mobileLabels: Record<string, Record<string, string>> = {
  my_addresses: {
    ru: 'Мои адреса',
    uz: 'Mening manzillarim',
    en: 'My addresses',
  },
}

export default function Profile() {
  const { data } = useCustomer()
  const router = useRouter()
  const { locale = 'ru' } = router

  return (
    <>
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
            {mobileLabels.my_addresses[locale] || 'Мои адреса'}
          </h1>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <UserData />
      </div>
      <Address />
    </>
  )
}

Profile.Layout = Layout
