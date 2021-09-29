import React, { FC, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { HeaderMenuItems } from '@commerce/types/headerMenu'

const HeaderMenu: FC<HeaderMenuItems> = ({ menuItems, setMobMenuOpen }) => {
  const { locale } = useRouter()
  const router = useRouter()

  const goTo = (link: string) => {
    setMobMenuOpen(false);
    router.push(link)
  }

  return (
    <ul className="space-y-4 ml-9">
      {menuItems.length &&
        menuItems.map((item) => {
          const keyTyped = `name_${locale}` as keyof typeof item
          return (
            <li key={item.id}>
              <button onClick={() => goTo(item.href)}>
                <a className="no-underline text-white">{item[keyTyped]}</a>
              </button>
            </li>
          )
        })}
    </ul>
  )
}

export default memo(HeaderMenu)
