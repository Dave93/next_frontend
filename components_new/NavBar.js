import React, { memo } from 'react'
import NavTab from 'react-storefront/nav/NavTab'
import NavTabs from 'react-storefront/nav/NavTabs'
import Link from 'react-storefront/link/Link'
import { Container, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

function NavBar({ tabs }) {
  return (
    <div className="rounded-[10px] shadow-md">
      <div className="flex justify-center">
        {tabs.map(cat => (
          <Link
            href={cat.href}
            key={cat.as}
            as={cat.as}
            className="px-12 my-2 no-underline uppercase font-bold py-3 inline-flex text-secondary"
          >
            {cat.text}
          </Link>
        ))}
      </div>
    </div>
  )
}

NavBar.defaultProps = {
  tabs: [],
}

export default memo(NavBar)
