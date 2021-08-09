import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import Pic from '/public/delivery.png'
import NewsItemData from '@commerce/data/news'

const NewsItem: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      {NewsItemData.map((news) => (
        <div className="bg-white rounded-3xl">
          <Image src={Pic} width="400" height="400" />
          <div className="p-5">
            <div className="text-lg mb-3">{news.name}</div>
            <div className="text-xs">{news.desc}</div>
          </div>
        </div>
      ))}
    </>
  )
}

export default memo(NewsItem)
