import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import NewsItemData from '@commerce/data/news'
import { ClockIcon, CalendarIcon } from '@heroicons/react/solid'

const NewsItem: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      {NewsItemData.map((news) => (
        <div className="bg-white rounded-3xl flex flex-col overflow-hidden">
          <div className="relative">
            <Image src={news.picture} width="400" height="400" />
            <div className="absolute bottom-5 flex justify-between px-4 text-white w-full">
              <div className="flex">
                <ClockIcon className="h-5 w-5 " />
                <div>22:00-03:00</div>
              </div>
              <div>
                <CalendarIcon className="h-5 w-5 " />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between p-5 flex-grow">
            <div className="text-lg mb-3">{news.name}</div>
            <div className="text-xs text-gray-400">{news.desc}</div>
          </div>
        </div>
      ))}
    </>
  )
}

export default memo(NewsItem)
