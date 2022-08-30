import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import Pic from '/public/delivery.png'
import menuItems from '@commerce/data/newsMenu'
import Link from 'next/link'
import { useRouter } from 'next/router'

const NewsList: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router

  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })

  return (
    <>
      <div className="flex">
        {items.map((item, id) => (
          <div className="flex items-center ml-10" key={id}>
            <img
              src={`${pathname == item.href ? item.activeIcon : item.icon}`}
            />
            <Link href={item.href} locale={locale} prefetch={false}>
              <a
                className={`${
                  pathname == item.href ? 'text-yellow' : 'text-gray-400'
                } ml-1 text-sm`}
              >
                {item.name}
              </a>
            </Link>
          </div>
        ))}
        <div className="bg-white rounded-3xl">
          <Image src={Pic} width="400" height="400" />
          <div className="p-5">
            <div className="text-lg mb-3">Бесплатная ночная доставка!</div>
            <div className="text-xs">Подробнее в описании</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(NewsList)
