'use client'

import { FC, memo } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Link } from '../../i18n/navigation'
import { useExtracted } from 'next-intl'

type Props = {
  citySlug: string
}

const NewsMenuTabsApp: FC<Props> = ({ citySlug }) => {
  const t = useExtracted()
  const pathname = usePathname() || ''

  const tabs = [
    {
      href: '/news',
      icon: '/bonuses.png',
      activeIcon: '/activeBonuses.png',
      label: t('Новости'),
    },
    {
      href: '/sale',
      icon: '/order.svg',
      activeIcon: '/activeOrder.svg',
      label: t('Акции'),
    },
  ]

  return (
    <div className="flex items-center justify-center md:my-10 space-x-6 py-6 md:py-0">
      {tabs.map((item) => {
        const href = `/${citySlug}${item.href}`
        const isActive = pathname.indexOf(item.href) >= 0
        return (
          <div key={item.href} className="flex items-center md:ml-10">
            <Image
              src={isActive ? item.activeIcon : item.icon}
              alt=""
              width={24}
              height={24}
            />
            <Link
              href={href}
              prefetch={false}
              className={`${isActive ? 'text-yellow' : 'text-gray-400'} ml-1 text-sm`}
            >
              {item.label}
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default memo(NewsMenuTabsApp)
