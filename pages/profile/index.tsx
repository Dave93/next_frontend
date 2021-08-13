import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next'
import useCustomer from '@framework/customer/use-customer'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import React from 'react'
import UserData from '@components_new/profile/UserData'
import Bonuses from '@components_new/profile/Bonuses'

// export async function getStaticProps({
//   preview,
//   locale,
//   locales,
// }: GetStaticPropsContext) {
//   const config = { locale, locales }
//   const pagesPromise = commerce.getAllPages({ config, preview })
//   const siteInfoPromise = commerce.getSiteInfo({ config, preview })
//   const { pages } = await pagesPromise
//   const { categories, topMenu, footerInfoMenu, socials } = await siteInfoPromise

//   return {
//     props: { pages, categories, topMenu, footerInfoMenu, socials },
//   }
// }

export async function getServerSideProps({
  preview,
  locale,
  locales,
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

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

export default function Profile() {
  const { data } = useCustomer()
  return (
    <>
      <UserData />
      <Bonuses />
    </>
  )
}

Profile.Layout = Layout
