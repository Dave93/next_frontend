'use client'

import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { ToastContainer } from 'react-toastify'
import { ManagedUIContext } from '@components/ui/context'
import FacebookPixel from '@components/common/FacebookPixel'
import { PostHogProvider } from '@lib/posthog'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000 },
        },
      })
  )

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  return (
    <PostHogProvider>
      <GoogleReCaptchaProvider
        reCaptchaKey="6LfDMQElAAAAAL0Nbu6ypK_-chUW81SXBIQgeuoe"
        language="RU"
      >
        <FacebookPixel />
        <ManagedUIContext pageProps={{}}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ManagedUIContext>
        <ToastContainer />
      </GoogleReCaptchaProvider>
    </PostHogProvider>
  )
}
