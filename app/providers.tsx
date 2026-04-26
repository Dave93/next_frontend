'use client'

import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Toaster } from 'sonner'
import FacebookPixel from '../components_new/analytics/FacebookPixelApp'
import { PostHogProvider } from '@lib/posthog-app'
import StorePersistRehydrator from '../components_new/common/StorePersistRehydrator'

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
        <QueryClientProvider client={queryClient}>
          <StorePersistRehydrator />
          {children}
        </QueryClientProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </GoogleReCaptchaProvider>
    </PostHogProvider>
  )
}
