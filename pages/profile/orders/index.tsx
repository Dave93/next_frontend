import UserData from '@components_new/profile/UserData'
import React from 'react'
import { Layout } from '@components/common'
import { GetStaticPropsContext } from 'next'
import commerce from '@lib/api/commerce'
import Orders from '@components_new/profile/Orders'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories, topMenu, footerInfoMenu, socials } = await siteInfoPromise

  return {
    props: { pages, categories, topMenu, footerInfoMenu, socials },
  }
}

export default function OrdersPage() {
  return (
    <div>
      <UserData />
      <Orders />
    </div>
  )
}

OrdersPage.Layout = Layout
