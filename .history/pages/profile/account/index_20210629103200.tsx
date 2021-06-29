import type { GetStaticPropsContext } from 'next'
import useCustomer from '@framework/customer/use-customer'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import React from 'react'
import UserData from '@components_new/profile/UserData'
import PersonalData from '@components_new/profile/PersonalData'


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

export default function Profile() {
  const { data } = useCustomer()
  return (
    <>
    <UserData />
      <PersonalData />
      </>
  )
}

Profile.Layout = Layout
