const commerce = require('./commerce.config.json')
const prod = process.env.NODE_ENV === 'production'
const {
  withCommerceConfig,
  getProviderName,
} = require('./framework/commerce/config')
const nextTranslate = require('next-translate')
// require('dotenv').config()

const provider = commerce.provider || getProviderName()
const isBC = provider === 'bigcommerce'
const isShopify = provider === 'shopify'
const isSaleor = provider === 'saleor'
const isSwell = provider === 'swell'
const isVendure = provider === 'vendure'
const withPWA = require('next-pwa')

module.exports =
  // withPWA(
  nextTranslate(
    withCommerceConfig({
      commerce,
      publicRuntimeConfig: {
        apiUrl: process.env.API_URL,
      },
      rewrites() {
        return [
          (isBC || isShopify || isSwell || isVendure) && {
            source: '/checkout',
            destination: '/api/checkout',
          },
          // The logout is also an action so this route is not required, but it's also another way
          // you can allow a logout!
          isBC && {
            source: '/logout',
            destination: '/api/logout?redirect_to=/',
          },
          // For Vendure, rewrite the local api url to the remote (external) api url. This is required
          // to make the session cookies work.
          isVendure &&
            process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL && {
              source: `${process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL}/:path*`,
              destination: `${process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL}/:path*`,
            },
        ].filter(Boolean)
      },
      images: {
        domains: ['store.hq.fungeek.net', 'api.hq.fungeek.net'],
      },
      pwa: {
        dest: 'public',
        disable: prod ? false : true,
      },
    })
  )
// )

// Don't delete this console log, useful to see the commerce config in Vercel deployments
console.log('next.config.js', JSON.stringify(module.exports, null, 2))
