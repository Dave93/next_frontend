import React, { FC, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { HeaderMenuItems } from '@commerce/types/headerMenu'

const HeaderMenu: FC<HeaderMenuItems> = ({ menuItems }) => {
  const { locale } = useRouter()
  return (
    <ul className="flex justify-between">
      {menuItems.length &&
        menuItems.map((item) => {
          const keyTyped = `name_${locale}` as keyof typeof item
          return (
            <li className="px-4" key={item.id}>
              <Link href={item.href} prefetch={false}>
                <a className="no-underline text-secondary">{item[keyTyped]}</a>
              </Link>
            </li>
          )
        })}
        <li className="px-4">
          <a href="https://telegram.me/HavoqandJamoa_Bot" target="_blank" className="no-underline text-secondary">{locale == "uz" ? "Jamoamizga qo’shiling" : "Присоединяйтесь к нашей команде"}</a>
        </li>
    </ul>
  )
}

export default memo(HeaderMenu)
