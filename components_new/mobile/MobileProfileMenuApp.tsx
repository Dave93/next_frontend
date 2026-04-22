'use client'

import { FC } from 'react'
import Link from 'next/link'
import {
  LocationMarkerIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChevronRightIcon,
} from '@heroicons/react/outline'
import { useUI } from '@components/ui/context'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '../../i18n/navigation'
import Cookies from 'js-cookie'

const labels: Record<string, Record<string, string>> = {
  welcome: { ru: 'Добро пожаловать', uz: 'Xush kelibsiz', en: 'Welcome' },
  sign_in: {
    ru: 'Войдите чтобы продолжить',
    uz: 'Davom etish uchun kiring',
    en: 'Sign in to continue',
  },
  login: { ru: 'Войти', uz: 'Kirish', en: 'Sign in' },
  my_addresses: {
    ru: 'Мои адреса',
    uz: 'Mening manzillarim',
    en: 'My addresses',
  },
  about: { ru: 'О нас', uz: 'Biz haqimizda', en: 'About us' },
  privacy: {
    ru: 'Политика конфиденциальности',
    uz: 'Maxfiylik siyosati',
    en: 'Privacy policy',
  },
  language: { ru: 'Язык', uz: 'Til', en: 'Language' },
  contact: {
    ru: 'Связаться с нами',
    uz: "Biz bilan bog'lanish",
    en: 'Contact us',
  },
  support: { ru: 'Поддержка', uz: "Qo'llab-quvvatlash", en: 'Support' },
  logout: { ru: 'Выйти', uz: 'Chiqish', en: 'Log out' },
}

const languages = [
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
  { code: 'en', label: 'EN' },
]

const MobileProfileMenuApp: FC = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { user, activeCity, openSignInModal } = useUI()
  const citySlug = activeCity?.slug || ''
  const t = (key: string) => labels[key]?.[locale] || labels[key]?.ru || key

  const handleLogout = () => {
    Cookies.remove('opt_token')
    localStorage.removeItem('opt_token')
    localStorage.removeItem('mijoz')
    window.location.reload()
  }

  const userInitial = user?.user?.name ? user.user.name[0].toUpperCase() : '?'

  return (
    <div className="md:hidden min-h-screen bg-gray-50 pb-20">
      {/* User Card */}
      {user ? (
        <Link
          href={`/${citySlug}/profile/account`}
          prefetch={false}
          className="mx-4 mt-4 flex items-center rounded-2xl bg-white p-4"
        >
          <div
            className="mr-4 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#F9B004' }}
          >
            <span className="text-xl font-bold text-white">{userInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">
              {user.user?.name || ''}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.user_contact || ''}
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
        </Link>
      ) : (
        <div className="mx-4 mt-4 flex flex-col items-center rounded-2xl bg-white p-6">
          <div className="mb-3 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-1">{t('welcome')}</p>
          <p className="text-sm text-gray-500 text-center mb-4">
            {t('sign_in')}
          </p>
          <button
            onClick={openSignInModal}
            className="rounded-full px-8 py-3 text-base font-semibold text-white"
            style={{ backgroundColor: '#F9B004' }}
          >
            {t('login')}
          </button>
        </div>
      )}

      {/* Menu Items */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white">
        {user && (
          <Link
            href={`/${citySlug}/profile/address`}
            prefetch={false}
            className="flex items-center px-5 py-4 border-b border-gray-100"
          >
            <div className="mr-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <LocationMarkerIcon className="w-5 h-5 text-gray-500" />
            </div>
            <span className="flex-1 text-base text-gray-800">
              {t('my_addresses')}
            </span>
            <ChevronRightIcon className="w-5 h-5 text-gray-300" />
          </Link>
        )}
        <Link
          href={`/${citySlug}/about`}
          prefetch={false}
          className="flex items-center px-5 py-4 border-b border-gray-100"
        >
          <div className="mr-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <InformationCircleIcon className="w-5 h-5 text-gray-500" />
          </div>
          <span className="flex-1 text-base text-gray-800">{t('about')}</span>
          <ChevronRightIcon className="w-5 h-5 text-gray-300" />
        </Link>
        <Link
          href={`/${citySlug}/privacy`}
          prefetch={false}
          className="flex items-center px-5 py-4"
        >
          <div className="mr-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-5 h-5 text-gray-500" />
          </div>
          <span className="flex-1 text-base text-gray-800">
            {t('privacy')}
          </span>
          <ChevronRightIcon className="w-5 h-5 text-gray-300" />
        </Link>
      </div>

      {/* Language Toggle */}
      <div className="mx-4 mt-4 rounded-2xl bg-white p-4">
        <p className="text-sm font-medium text-gray-500 mb-3">
          {t('language')}
        </p>
        <div className="flex rounded-xl overflow-hidden">
          {languages.map((lang, index) => {
            const isActive = locale === lang.code
            return (
              <Link
                key={lang.code}
                href={pathname}
                locale={lang.code as 'ru' | 'uz' | 'en'}
                prefetch={false}
                className={`flex-1 py-3 text-center text-sm font-semibold ${
                  index === 0
                    ? 'rounded-l-xl'
                    : index === 2
                    ? 'rounded-r-xl'
                    : ''
                }`}
                style={
                  isActive
                    ? { backgroundColor: '#F9B004', color: '#fff' }
                    : {
                        backgroundColor: '#fff',
                        color: '#374151',
                        border: '1px solid #E5E7EB',
                      }
                }
              >
                {lang.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Support Section */}
      <div className="mx-4 mt-4 space-y-2">
        <a
          href="https://t.me/choparhelpbot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center rounded-2xl bg-white p-4"
        >
          <div
            className="mr-3 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#0088cc' }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.281c-.146.658-.537.818-1.084.508l-3-2.211-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.942z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-800">
              {t('contact')}
            </p>
            <p className="text-xs text-gray-500">{t('support')}</p>
          </div>
        </a>

        {activeCity?.phone && (
          <a
            href={`tel:${activeCity.phone}`}
            className="flex items-center rounded-2xl bg-white p-4"
          >
            <div
              className="mr-3 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#F9B004' }}
            >
              <PhoneIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Call center</p>
              <p className="text-base font-semibold text-gray-800">
                {activeCity.phone}
              </p>
            </div>
          </a>
        )}
      </div>

      {/* Logout */}
      {user && (
        <div className="mx-4 mt-6">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-full text-base font-bold text-white"
            style={{ backgroundColor: '#F9B004' }}
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  )
}

export default MobileProfileMenuApp
