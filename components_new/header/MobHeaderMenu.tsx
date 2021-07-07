import React, { FC, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { HeaderMenuItems } from '@commerce/types/headerMenu'

const HeaderMenu: FC<HeaderMenuItems> = ({ menuItems }) => {
  const { locale } = useRouter()
  return (
    <ul className="space-y-4 border-b mb-7 pb-7">
      {menuItems.length &&
        menuItems.map((item) => {
          const keyTyped = `name_${locale}` as keyof typeof item
          return (
            <li className="ml-12" key={item.id}>
              <Link href={item.href} prefetch={false}>
                <a className="no-underline text-white">{item[keyTyped]}</a>
              </Link>
            </li>
          )
        })}
    </ul>
  )
}

export default memo(HeaderMenu)
