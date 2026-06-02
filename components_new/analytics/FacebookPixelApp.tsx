'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    import('react-facebook-pixel').then((mod) => {
      mod.default.pageView()
    })
  }, [pathname, searchParams])

  return null
}

export default function FacebookPixelApp() {
  useEffect(() => {
    // Defer the pixel SDK download + init until the main thread is idle so it
    // doesn't compete with hydration (the FB SDK costs ~217ms of main-thread
    // work). A ~2s delay on the first pixel pageview is fine for attribution.
    const start = () =>
      import('react-facebook-pixel').then((mod) => {
        mod.default.init('1576327222715107')
        mod.default.pageView()
      })

    const ric = window.requestIdleCallback
    if (ric) {
      const id = ric(start, { timeout: 4000 })
      return () => window.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(start, 2500)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  )
}
