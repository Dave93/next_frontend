'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!POSTHOG_KEY || !pathname) return
    let url = window.origin + pathname
    const qs = searchParams?.toString()
    if (qs) url = `${url}?${qs}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!POSTHOG_KEY) {
      console.warn('PostHog: NEXT_PUBLIC_POSTHOG_KEY not set, skipping init')
      return
    }

    // Defer init until the main thread is idle — posthog-js init + autocapture
    // listeners cost ~260ms of main-thread work that otherwise lands during
    // hydration and inflates INP. PostHogPageView's mount-time capture runs
    // before init (no-op while unloaded), so we emit the initial $pageview here
    // once posthog is ready to avoid losing it.
    const start = () => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
        persistence: 'localStorage',
        autocapture: true,
      })
      posthog.capture('$pageview', { $current_url: window.location.href })
    }

    const ric = window.requestIdleCallback
    if (ric) {
      const id = ric(start, { timeout: 4000 })
      return () => window.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(start, 2500)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  )
}

export function usePostHog() {
  return posthog
}
