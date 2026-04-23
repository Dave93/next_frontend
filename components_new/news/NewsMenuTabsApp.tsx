'use client'

import { FC, memo } from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '../../i18n/navigation'
import { useExtracted } from 'next-intl'

type Props = {
  citySlug: string
}

const TABS: Array<{
  href: string
  icon: string
  activeIcon: string
  label: string
}> = [
  {
    href: '/news',
    icon: '/bonuses.png',
    activeIcon: '/activeBonuses.png',
    label: 'Новости',
  },
  {
    href: '/sale',
    icon: '/order.svg',
    activeIcon: '/activeOrder.svg',
    label: 'Акции',
  },
]

const NewsMenuTabsApp: FC<Props> = ({ citySlug }) => {
  const t = useExtracted()
  const pathname = usePathname() || ''

  return (
    <div className="flex items-center justify-center md:my-10 space-x-6 py-6 md:py-0">
      {TABS.map((item) => {
        const href = `/${citySlug}${item.href}`
        const isActive = pathname.indexOf(item.href) >= 0
        return (
          <div key={item.href} className="flex items-center md:ml-10">
            <img src={isActive ? item.activeIcon : item.icon} alt="" />
            <Link
              href={href}
              prefetch={false}
              className={`${isActive ? 'text-yellow' : 'text-gray-400'} ml-1 text-sm`}
            >
              {t(item.label)}
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default memo(NewsMenuTabsApp)
