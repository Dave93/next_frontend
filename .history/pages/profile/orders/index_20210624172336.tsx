import UserName from "@components_new/profile/UserName";
import React, { memo, FC } from "react";
import { Layout } from '@components/common'
import { GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";


export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories } = await siteInfoPromise

  return {
    props: { pages, categories },
  }
}

const OrdersPage = () => {
    return (
      <div>
        <UserName />
      </div>
    )
}

OrdersPage.Layout = Layout

export default memo(OrdersPage)