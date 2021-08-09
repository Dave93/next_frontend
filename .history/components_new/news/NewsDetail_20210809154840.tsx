import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import news from '@commerce/data/news'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NewsItem from '../news/NewsItem'

const NewsDetail: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router

  return <>{news.filter((item) => item.id === 1)}</>
}

export default memo(NewsDetail)
