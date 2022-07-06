import { Fragment, FC, memo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import menuItems from '@commerce/data/profileMenu'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import Link from 'next/link'
import { useRouter } from 'next/router'

const UserName: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router

  const { user } = useUI()
  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })
  console.log(pathname)
  console.log(items)
  return (
    <div className="flex justify-between">
      <div>
        <div className="text-3xl mb-1">Привет, Зафар!</div>
        <div className="text-xs w-80 text-gray-400">
          Это ваш личный кабинет. Здесь вы можете управлять своими заказами,
          редактировать личные данные и следить за избранными товарами
        </div>
      </div>
      <div className="flex items-end">
        {items.map((item, id) => (
          <div className="flex items-center ml-12" key={id}>
            <img src={item.icon} />
            <Link href={item.href} locale={locale} prefetch={false}>
              <div className="">
                <a
                  className={`${
                    pathname == item.href ? 'text-yellow' : 'text-gray-400'
                  }` 'ml-1 text-sm'}
                >
                  {item.name}
                </a>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(UserName)
