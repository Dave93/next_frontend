import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import NewsItemData from '@commerce/data/news'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'

const NewsDetail: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const orderId = router.query.id
  const news = NewsItemData.find((item: any) => item.id == orderId)

  return (
    <>
      <div className="bg-white rounded-3xl flex p-5">
        <div className="">
          <Image src="/detail.png" width="450" height="450" />
        </div>
        <div className="">
          <div>Бесплатная ночная доставка!</div>
          <div> 22.07.2021</div>
          <div>
            Доставка в Chopar Pizza стала еще выгоднее Весь июнь: → с 10:00 до
            22:00 – доставка в пределах города 5000 сумов; → с 22:00 до 03:00 –
            доставка бесплатная. Заказывайте пиццу, которая объединяет !
          </div>
          <div>
            Chopar Pizzada yetkazib berish xizmati yanada arzonroq bo'ldi Iyun
            oyida shahar bo‘ylab yetkazib berish: → soat 10:00 dan 22:00 gacha —
            5000 so'm; → soat 22:00 dan 03:00 gacha esa — bepul! Birinchi milliy
            pitsaga qulay !
          </div>
          <div>Акция дейсвует до 01.08.2021</div>
        </div>
      </div>
    </>
  )
}

export default memo(NewsDetail)
