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
    console.log(news)
  
  return (
    <>
        <div className="bg-white rounded-3xl flex flex-col overflow-hidden">
          <div className="relative">
            <Image src={news.picture} width="400" height="400" />
          </div>
          <div className="flex flex-col justify-between p-5 flex-grow">
          </div>
        </div>
    </>
  )
}

export default memo(NewsDetail)
