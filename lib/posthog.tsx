import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useRouter } from 'next/router'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!POSTHOG_KEY) {
      console.warn('PostHog: NEXT_PUBLIC_POSTHOG_KEY not set, skipping init')
      return
    }

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog initialized (website)')
        }
      },
      capture_pageview: false, // We capture manually via routeChangeComplete
      capture_pageleave: true,
      persistence: 'localStorage',
      autocapture: true,
    })
  }, [])

  // Track page views on route changes (Pages Router)
  useEffect(() => {
    if (!POSTHOG_KEY) return

    const handleRouteChange = () => {
      posthog.capture('$pageview')
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    // Capture initial pageview
    posthog.capture('$pageview')

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return <>{children}</>
}

export function usePostHog() {
  return posthog
}
