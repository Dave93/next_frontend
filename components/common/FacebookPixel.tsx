import { Router } from 'next/router'
import React from 'react'

function FacebookPixel() {
  React.useEffect(() => {
    let handler: (() => void) | null = null

    import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init('1576327222715107')
        ReactPixel.pageView()

        handler = () => ReactPixel.pageView()
        Router.events.on('routeChangeComplete', handler)
      })

    return () => {
      if (handler) {
        Router.events.off('routeChangeComplete', handler)
      }
    }
  }, [])
  return null
}

export default FacebookPixel
