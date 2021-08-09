import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import news from '@commerce/data/news'
import Link from 'next/link'
import { useRouter } from 'next/router'

const NewsDetail: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const orderId = router.query.id

  return <>{news.find((item) => item.id === orderId)}</>
}

export default memo(NewsDetail)
