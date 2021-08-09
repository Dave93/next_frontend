import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import NewsItemData from '@commerce/data/news'

const NewsItem: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      {NewsItemData.map((news) => (
        <div className="bg-white rounded-3xl overflow-hidden">
          <Image src={news.picture} width="400" height="400" />
          <div className="flex flex-col min-h-max justify-between p-5">
            <div className="text-lg mb-3">{news.name}</div>
            <div className="text-xs">{news.desc}</div>
          </div>
        </div>
      ))}
    </>
  )
}

export default memo(NewsItem)
