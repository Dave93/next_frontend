'use client'

import { FC, Fragment, memo, useEffect, useState } from 'react'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import { useUI } from '@components/ui/context'
import { useUserStore } from '../../lib/stores/user-store'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'
import { useExtracted } from 'next-intl'
import { Link, useRouter } from '../../i18n/navigation'

const YELLOW = '#FAAF04'

const SignInButtonApp: FC = () => {
  const t = useExtracted()
  const user = useUserStore((s) => s.user) as any
  const activeCity = useLocationStore((s) => s.activeCity) as any
  const openSignInModal = useUIStore((s) => s.openSignInModal)
  const { setUserData } = useUI() as any
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const displayName: string | undefined = user?.user?.name

  const initial = (displayName || '').trim().charAt(0).toUpperCase() || '?'

  const citySlug = activeCity?.slug || 'tashkent'

  const handleLogout = (close: () => void) => {
    close()
    try {
      localStorage.removeItem('mijoz')
      localStorage.removeItem('basketId')
    } catch {}
    setUserData?.(null)
    router.push(`/${citySlug}`)
  }

  if (!isClient || !displayName) {
    return (
      <button
        className="md:bg-gray-200 bg-yellow px-8 py-1 rounded-full text-secondary outline-none focus:outline-none mb-5 md:mb-0 ml-1 md:ml-0 font-bold md:font-normal"
        onClick={openSignInModal}
      >
        {t('Войти')}
      </button>
    )
  }

  const items = [
    {
      label: t('Личный кабинет'),
      href: `/${citySlug}/profile/account`,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: t('Мои заказы'),
      href: `/${citySlug}/profile/orders`,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      ),
    },
    {
      label: t('Мои адреса'),
      href: `/${citySlug}/profile/address`,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ]

  return (
    <Popover className="relative ml-1">
      {({ open, close }) => (
        <>
          <PopoverButton
            className={`flex items-center gap-2 h-10 pr-3 pl-1 rounded-full transition-colors outline-none ${
              open ? 'bg-yellow-100' : 'hover:bg-gray-100'
            }`}
            aria-label="profile"
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: YELLOW }}
            >
              {initial}
            </span>
            <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">
              {displayName}
            </span>
            <svg
              className={`text-gray-500 transition-transform ${
                open ? 'rotate-180' : ''
              }`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
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
            <PopoverPanel className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 focus:outline-none overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: YELLOW }}
                  >
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {displayName}
                    </div>
                    {user?.user?.phone && (
                      <div className="text-xs text-gray-500 truncate">
                        {user.user.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <ul className="py-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      onClick={() => close()}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                    >
                      <span className="text-gray-400">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleLogout(close)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {t('Выйти')}
                </button>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default memo(SignInButtonApp)
