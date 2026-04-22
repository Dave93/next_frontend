const commerce = require('./commerce.config.json')
const {
  withCommerceConfig,
  getProviderName,
} = require('./framework/commerce/config')
const nextTranslate = require('next-translate-plugin')
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const provider = commerce.provider || getProviderName()
const isBC = provider === 'bigcommerce'
const isShopify = provider === 'shopify'
const isSwell = provider === 'swell'
const isVendure = provider === 'vendure'

const baseConfig = withCommerceConfig({
  commerce,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
  rewrites() {
    return [
      (isBC || isShopify || isSwell || isVendure) && {
        source: '/checkout',
        destination: '/api/checkout',
      },
      isBC && {
        source: '/logout',
        destination: '/api/logout?redirect_to=/',
      },
      isVendure &&
        process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL && {
          source: `${process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL}/:path*`,
          destination: `${process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL}/:path*`,
        },
    ].filter(Boolean)
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'store.hq.fungeek.net' },
      { protocol: 'https', hostname: 'api.hq.fungeek.net' },
      { protocol: 'https', hostname: 'choparpizza.uz' },
      { protocol: 'https', hostname: 'api.choparpizza.uz' },
    ],
  },
})

// Композируем оба плагина: next-intl сверху, next-translate снизу.
// Pages Router использует next-translate (legacy), App Router — next-intl.
module.exports = withNextIntl(nextTranslate(baseConfig))
