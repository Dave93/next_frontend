import UserData from '@components_new/profile/UserData'
import React from "react";
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

export default function  OrdersPage() {
    return (
      <div>
        <UserData />
      </div>
    )
}

OrdersPage.Layout = Layout