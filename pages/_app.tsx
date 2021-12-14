import 'tailwindcss/tailwind.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'
import '@assets/fonts.css'
import '@assets/simplebar.css'

import 'react-toastify/dist/ReactToastify.css'
import '@egjs/flicking-plugins/dist/arrow.css'

import { FC, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import { ToastContainer } from 'react-toastify'
import { pwaTrackingListeners } from '../scripts/pwaEventlisteners'
import FacebookPixel from '@components/common/FacebookPixel'
import { YMInitializer } from 'react-yandex-metrika'

const isBrowser = typeof window !== 'undefined'

if (isBrowser) {
  pwaTrackingListeners()
}

const Noop: FC = ({ children }) => <>{children}</>

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  return (
    <>
      <Head />
      <FacebookPixel />
      <ManagedUIContext pageProps={pageProps}>
        <Layout pageProps={pageProps}>
          <Component {...pageProps} />
        </Layout>
      </ManagedUIContext>
      <ToastContainer />
      <YMInitializer
        accounts={[86632071]}
        options={{
          webvisor: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
        }}
        version="2"
      />
    </>
  )
}
