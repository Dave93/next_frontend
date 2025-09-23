import 'tailwindcss/tailwind.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'
import '@assets/fonts.css'
import '@assets/simplebar.css'

import 'react-toastify/dist/ReactToastify.css'
import '@egjs/flicking-plugins/dist/arrow.css'

import '@components_new/header/DatePicker.css'

// Import Leaflet CSS globally for map pages
import 'leaflet/dist/leaflet.css'

import { FC, ReactNode, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import { ToastContainer } from 'react-toastify'
import { pwaTrackingListeners } from '../scripts/pwaEventlisteners'
import FacebookPixel from '@components/common/FacebookPixel'
import { QueryClient, QueryClientProvider } from 'react-query'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { YMInitializer } from 'react-yandex-metrika'

const isBrowser = typeof window !== 'undefined'

if (isBrowser) {
  pwaTrackingListeners()
}

const queryClient = new QueryClient()
const Noop: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  return (
    <>
      <GoogleReCaptchaProvider
        reCaptchaKey="6LfDMQElAAAAAL0Nbu6ypK_-chUW81SXBIQgeuoe"
        language="RU"
      >
        <Head />
        <FacebookPixel />
        <ManagedUIContext pageProps={pageProps}>
          <QueryClientProvider client={queryClient}>
            <Layout pageProps={pageProps}>
              <Component {...pageProps} />
            </Layout>
          </QueryClientProvider>
        </ManagedUIContext>
        <ToastContainer />
        {/* <YMInitializer
        accounts={[86632071]}
        options={{
          webvisor: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
        }}
        version="2"
      /> */}
      </GoogleReCaptchaProvider>
    </>
  )
}
