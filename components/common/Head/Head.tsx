import { FC } from 'react'
import NextHead from 'next/head'
import { DefaultSeo } from 'next-seo'
import config from '@config/seo.json'

const APP_NAME = 'Chopar Pizza'
const APP_DESCRIPTION = 'Chopar Pizza'

const Head: FC = () => {
  return (
    <>
      <DefaultSeo {...config} />
      <NextHead>
        <meta name="application-name" content={APP_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" key="site-manifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta
          name="facebook-domain-verification"
          content="1cbfdowdmxfmaj1ra212tsl5llytrw"
        />
        <meta
          name="google-site-verification"
          content="H21dFJEAqKhW0aNLhQCkmy7tauAQZKlPv8QbQJFKcPQ"
        />
        <meta name="yandex-verification" content="7a363d3fcee84347" />
      </NextHead>
    </>
  )
}

export default Head
