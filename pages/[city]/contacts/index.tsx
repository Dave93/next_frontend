import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Contacts from '@components_new/contacts/Contacts'
import React from 'react'
import Head from 'next/head'
import { NextSeo } from 'next-seo'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
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
      categories,
      brands,
      topMenu,
      currentCity,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

export default function ContactsPage() {
  return (
    <>
      <NextSeo
        title="Наши контакты"
        description="Контакты и график работы Chopar Pizza"
      />
      <Contacts />
    </>
  )
}

ContactsPage.Layout = Layout
