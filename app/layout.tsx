import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Providers from './providers'
import RestaurantJsonLd from '@components_new/seo/RestaurantJsonLd'
import SiteJsonLd from '@components_new/seo/SiteJsonLd'

import 'tailwindcss/tailwind.css'
import '@assets/chrome-bug.css'
import '@assets/fonts.css'
import '@assets/simplebar.css'
// sonner ships its own CSS
import '@components_new/header/DatePicker.css'

const ROOT_DESC: Record<string, string> = {
  ru: 'Доставка пиццы с тандырным тестом в Ташкенте. Халяль. Бесплатная доставка.',
  uz: "Toshkentda tandir xamirli pitsa yetkazib berish. Halol. Bepul yetkazib berish.",
  en: 'Pizza delivery with tandoor dough in Tashkent. Halal. Free delivery.',
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    metadataBase: new URL('https://choparpizza.uz'),
    title: {
      default: 'Chopar Pizza',
      template: '%s | Chopar Pizza',
    },
    description: ROOT_DESC[locale] || ROOT_DESC.ru,
    applicationName: 'Chopar Pizza',
    manifest: '/manifest.json',
    formatDetection: { telephone: true, address: false, email: false },
    appleWebApp: {
      capable: true,
      title: 'Chopar Pizza',
      statusBarStyle: 'default',
    },
    verification: {
      google: process.env.NEXT_PUBLIC_SEO_GOOGLE_VERIFICATION || undefined,
      yandex: process.env.NEXT_PUBLIC_SEO_YANDEX_VERIFICATION || undefined,
      other: {
        'mailru-verification':
          process.env.NEXT_PUBLIC_SEO_MAILRU_VERIFICATION || '',
        'msvalidate.01':
          process.env.NEXT_PUBLIC_SEO_BING_VERIFICATION || '',
        'facebook-domain-verification':
          process.env.NEXT_PUBLIC_SEO_FB_VERIFICATION || '',
      },
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#FAAF04',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <RestaurantJsonLd />
        <SiteJsonLd />
      </head>
      <body className="min-h-screen flex flex-col">
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TSJ79WZ" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>

        <Script id="gtm-init" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TSJ79WZ');`}
        </Script>

        <Script id="crm-loader" strategy="lazyOnload">
          {`var s=document.createElement('script');s.async=true;
s.src='/crm-scripts/ct.min.js?'+(Date.now()/60000|0);
document.body.appendChild(s);`}
        </Script>
      </body>
    </html>
  )
}
