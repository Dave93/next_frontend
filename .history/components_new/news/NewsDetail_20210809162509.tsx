import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'

import menuItems from '@commerce/data/newsMenu'

const NewsDetail: FC = () => {
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
      <div className="flex items-center justify-center my-10">
        {items.map((item, id) => (
          <div key={id} className="flex items-center ml-10">
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
      </div>
      <div className="bg-white rounded-3xl flex p-5">
        <div className="">
          <Image src="/detail.png" width="450" height="450" />
        </div>
        <div className="ml-16 w-[463px]">
          <div className="text-2xl">Бесплатная ночная доставка!</div>
          <div className="text-sm text-gray-400 mb-8"> 22.07.2021</div>
          <div className="mb-8">
            Доставка в Chopar Pizza стала еще выгоднее Весь июнь: → с 10:00 до
            22:00 – доставка в пределах города 5000 сумов; → с 22:00 до 03:00 –
            доставка бесплатная. Заказывайте пиццу, которая объединяет !
          </div>
          <div className="">
            Chopar Pizzada yetkazib berish xizmati yanada arzonroq bo'ldi Iyun
            oyida shahar bo‘ylab yetkazib berish: → soat 10:00 dan 22:00 gacha —
            5000 so'm; → soat 22:00 dan 03:00 gacha esa — bepul! Birinchi milliy
            pitsaga qulay !
          </div>
          <div className="text-yellow">Акция дейсвует до 01.08.2021</div>
        </div>
      </div>
    </>
  )
}

export default memo(NewsDetail)
