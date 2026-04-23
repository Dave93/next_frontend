'use client'

import { FC, memo } from 'react'
import menuItems from '@commerce/data/profileMenu'
import { useUI } from '@components/ui/context'
import Link from 'next/link'
import { usePathname, useRouter } from '../../i18n/navigation'
import { useLocale } from 'next-intl'

const langMap: Record<string, string> = {
  profile_orders: 'История заказов',
  profile_address: 'Адрес',
  profile_account: 'Личные данные',
  profile_logout: 'Выйти',
  profile_bonuses: 'Бонусы',
}

const UserDataApp: FC = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const { user, setUserData, activeCity } = useUI()

  const items = menuItems.map((item) => ({
    ...item,
    name: langMap[item.langCode] ?? item.langCode,
  }))

  const logout = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.removeItem('mijoz')
    localStorage.removeItem('basketId')
    setUserData(null)
    router.push(`/${activeCity?.slug}`)
  }

  return (
    <div className="border-b justify-between md:flex pb-5 mx-5 md:mx-0">
      <div>
        <div className="text-3xl mb-1">Привет, {user?.user?.name}!</div>
        <div className="md:text-xs md:w-80 text-gray-400">
          Управляйте своим профилем и заказами
        </div>
      </div>
      <div className="flex items-end justify-between mt-5">
        {items.map((item, id) => {
          let href = item.href
          if (href.indexOf('http') < 0) {
            href = `/${activeCity?.slug}${item.href}`
          }
          return (
            <div className="flex items-center md:ml-10" key={id}>
              <img
                src={`${
                  pathname.indexOf(item.href) >= 0 ? item.activeIcon : item.icon
                }`}
                alt=""
              />
              {item.href === '/profile/logout' ? (
                <span
                  className="block ml-1 text-sm cursor-pointer text-gray-400"
                  onClick={logout}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={href}
                  locale={locale as any}
                  prefetch={false}
                  className={`${
                    pathname.indexOf(item.href) >= 0
                      ? 'text-yellow'
                      : 'text-gray-400'
                  } ml-1 text-sm`}
                >
                  {item.name}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(UserDataApp)
