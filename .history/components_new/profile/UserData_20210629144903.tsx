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

  const { user, setUserData } = useUI()
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
    router.push('/')
  }

  return (
    <div className="border-b justify-between md:flex pb-5">
      <div>
        <div className="text-3xl mb-1">Привет, {user?.name}!</div>
        <div className="text-xs w-80 text-gray-400">
          Это ваш личный кабинет. Здесь вы можете управлять своими заказами,
          редактировать личные данные и следить за избранными товарами
        </div>
      </div>
      <div className="flex items-end">
        {items.map((item, id) => (
          <div className="flex items-center ml-10" key={id}>
            <img
              src={`${pathname == item.href ? item.activeIcon : item.icon}`}
            />
            {item.href == '/profile/logout' ? (
              <span
                className="block ml-1 text-sm cursor-pointer text-gray-400"
                onClick={logout}
              >
                {item.name}
              </span>
            ) : (
              <Link href={item.href} locale={locale} prefetch={false}>
                <a
                  className={`${
                    pathname == item.href ? 'text-yellow' : 'text-gray-400'
                  } ml-1 text-sm`}
                >
                  {item.name}
                </a>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(UserData)
