import type { Metadata } from 'next'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Providers from './providers'
import RestaurantJsonLd from '@components_new/seo/RestaurantJsonLd'

import 'tailwindcss/tailwind.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'
import '@assets/fonts.css'
import '@assets/simplebar.css'
import 'react-toastify/dist/ReactToastify.css'
import '@egjs/flicking-plugins/dist/arrow.css'
import '@components_new/header/DatePicker.css'

export const metadata: Metadata = {
  title: {
    default: 'Chopar Pizza',
    template: '%s | Chopar Pizza',
  },
  description:
    'Доставка пиццы с тандырным тестом в Ташкенте. Халяль. Бесплатная доставка.',
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
      </head>
      <body className="loading min-h-screen flex flex-col">
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TSJ79WZ" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>

        <Script id="gtm-init" strategy="afterInteractive">
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
