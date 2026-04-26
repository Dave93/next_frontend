'use client'

import { FC, Fragment } from 'react'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import { Link } from '../../i18n/navigation'
import { useLocationStore } from '../../lib/stores/location-store'
import { useExtracted } from 'next-intl'

const SideMenuApp: FC = () => {
  const activeCity = useLocationStore((s) => s.activeCity)
  const t = useExtracted()
  const citySlug = activeCity?.slug || 'tashkent'

  const items = [
    { label: t('О нас'), href: '/about' },
    { label: t('Доставка и оплата'), href: '/delivery' },
    { label: t('Адреса ресторанов'), href: '/branch' },
    { label: t('Контакты'), href: '/contacts' },
    { label: t('Акции'), href: '/sale' },
    { label: t('Конфиденциальность'), href: '/privacy' },
  ]

  return (
    <Popover className="relative md:ml-3">
      {({ open, close }) => (
        <>
          <PopoverButton
            aria-label="menu"
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors outline-none ${
              open
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {open ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-2 scale-95"
          >
            <PopoverPanel className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 py-2 z-50 focus:outline-none">
              <div className="px-4 pt-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t('Меню')}
              </div>
              <ul>
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${citySlug}${item.href}`}
                      prefetch={false}
                      onClick={() => close()}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default SideMenuApp
