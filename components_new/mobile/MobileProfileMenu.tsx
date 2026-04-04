import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LocationMarkerIcon,
  ClipboardListIcon,
  GlobeAltIcon,
  PhoneIcon,
  DeviceMobileIcon,
  LogoutIcon,
  ChevronRightIcon,
  UserIcon,
} from '@heroicons/react/outline'
import { useUI } from '@components/ui/context'
import useTranslation from 'next-translate/useTranslation'
import Cookies from 'js-cookie'

const languages = [
  { code: 'ru', label: 'Рус' },
  { code: 'uz', label: "O'zb" },
  { code: 'en', label: 'Eng' },
]

const MobileProfileMenu: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, query, asPath } = router
  const { user, activeCity } = useUI()
  const citySlug = (query.city as string) || activeCity?.slug || ''

  if (!user) return null

  const handleLogout = () => {
    Cookies.remove('opt_token')
    localStorage.removeItem('opt_token')
    localStorage.removeItem('mijoz')
    window.location.reload()
  }

  return (
    <div className="md:hidden bg-white divide-y divide-gray-100">
      {/* User info header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {user.user?.name || ''}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.user_contact || ''}
          </p>
        </div>
      </div>

      {/* My Addresses */}
      <Link href={`/${citySlug}/profile/address`} prefetch={false} className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <LocationMarkerIcon className="w-5 h-5 text-gray-500" />
        </div>
        <span className="flex-1 text-sm text-gray-800">Мои адреса</span>
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      </Link>

      {/* My Orders */}
      <Link href={`/${citySlug}/myorders`} prefetch={false} className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ClipboardListIcon className="w-5 h-5 text-gray-500" />
        </div>
        <span className="flex-1 text-sm text-gray-800">
          {tr('profile_orders')}
        </span>
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      </Link>

      {/* Language */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <GlobeAltIcon className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 flex items-center gap-2">
          {languages.map((lang) => {
            const isActive = locale === lang.code
            return (
              <Link
                key={lang.code}
                href={asPath}
                locale={lang.code}
                prefetch={false}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={
                  isActive
                    ? { backgroundColor: '#F9B004', color: '#fff' }
                    : { backgroundColor: '#F3F4F6', color: '#374151' }
                }
              >
                {lang.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Support phone */}
      {activeCity?.phone && (
        <a
          href={`tel:${activeCity.phone}`}
          className="flex items-center gap-3 px-4 py-3"
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <PhoneIcon className="w-5 h-5 text-gray-500" />
          </div>
          <span className="flex-1 text-sm text-gray-800">
            {activeCity.phone}
          </span>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </a>
      )}

      {/* Download App */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <DeviceMobileIcon className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <a
            href="https://apps.apple.com/uz/app/chopar-pizza/id1597897308"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/appleReady.svg" alt="App Store" className="h-9" />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=havoqand.chopar"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/googleReady.svg" alt="Google Play" className="h-9" />
          </a>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 w-full text-left"
      >
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <LogoutIcon className="w-5 h-5 text-gray-500" />
        </div>
        <span className="flex-1 text-sm text-gray-800">
          {tr('profile_logout')}
        </span>
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  )
}

export default MobileProfileMenu
