import { FC, memo } from 'react'
import menuItems from '@commerce/data/profileMenu'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import Link from 'next/link'
import { useRouter } from 'next/router'

const UserData: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router

  const { user, setUserData, activeCity } = useUI()

  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })

  const logout = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.removeItem('mijoz')
    setUserData(null)
    router.push(`/${activeCity.slug}`)
  }

  return (
    <div className="border-b justify-between md:flex pb-5">
      <div>
        <div className="text-3xl mb-1">
          {tr('profile_hello')}, {user?.user?.name}!
        </div>
        <div className="text-xs w-80 text-gray-400">{tr('profile_desc')}</div>
      </div>
      <div className="flex items-end">
        {items.map((item, id) => {
          let href = item.href
          if (href.indexOf('http') < 0) {
            href = `/${activeCity.slug}${item.href}`
          }
          return (
            <div className="flex items-center ml-10" key={id}>
              <img
                src={`${
                  pathname.indexOf(item.href) >= 0 ? item.activeIcon : item.icon
                }`}
              />
              {item.href == '/profile/logout' ? (
                <span
                  className="block ml-1 text-sm cursor-pointer text-gray-400"
                  onClick={logout}
                >
                  {item.name}
                </span>
              ) : (
                <Link href={href} locale={locale} prefetch={false}>
                  <a
                    className={`${
                      pathname.indexOf(item.href) >= 0
                        ? 'text-yellow'
                        : 'text-gray-400'
                    } ml-1 text-sm`}
                  >
                    {item.name}
                  </a>
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(UserData)
