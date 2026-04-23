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
    import('react-facebook-pixel').then((mod) => {
      mod.default.init('1576327222715107')
      mod.default.pageView()
    })
  }, [])

  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  )
}
