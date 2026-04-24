import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin({
  requestConfig: './i18n/request.ts',
  experimental: {
    srcPath: ['./app', './components_new'],
    messages: {
      path: './messages',
      format: 'po',
      locales: 'infer',
    },
    extract: {
      sourceLocale: 'ru',
    },
  },
})

const config: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'store.hq.fungeek.net' },
      { protocol: 'https', hostname: 'api.hq.fungeek.net' },
      { protocol: 'https', hostname: 'choparpizza.uz' },
      { protocol: 'https', hostname: 'api.choparpizza.uz' },
      { protocol: 'https', hostname: 'cdn.choparpizza.uz' },
      { protocol: 'https', hostname: 'n.choparpizza.uz' },
    ],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 120, 160, 250, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

export default withNextIntl(config)
