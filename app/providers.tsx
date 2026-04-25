'use client'

import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Toaster } from 'sonner'
import { ManagedUIContext } from '@components/ui/context'
import { CommerceProvider } from '@framework'
import FacebookPixel from '../components_new/analytics/FacebookPixelApp'
import { PostHogProvider } from '@lib/posthog-app'

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
        <CommerceProvider locale="ru">
          <ManagedUIContext pageProps={{}}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </ManagedUIContext>
        </CommerceProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </GoogleReCaptchaProvider>
    </PostHogProvider>
  )
}
