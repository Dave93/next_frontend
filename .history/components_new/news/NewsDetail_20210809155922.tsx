import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import news from '@commerce/data/news'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'

const NewsDetail: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const orderId = router.query.id

    return (
      <>
        <div className="bg-white rounded-3xl flex flex-col overflow-hidden">
          <div className="relative">
            <Image src={news.picture} width="400" height="400" />
            <div className="absolute bottom-5 flex justify-between px-4 text-white w-full">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                <div>22:00-03:00</div>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <div>01.07-31.07</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between p-5 flex-grow">
            <div className="text-lg mb-3">{news.name}</div>
            <Link href={`${'/news/' + news.id}`}>
              <a className="text-xs text-gray-400">{news.desc}</a>
            </Link>
          </div>
        </div>
      </>
    )
}

export default memo(NewsDetail)
