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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
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
