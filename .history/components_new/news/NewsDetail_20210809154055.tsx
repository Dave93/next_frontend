import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import menuItems from '@commerce/data/newsMenu'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NewsItem from '../news/NewsItem'

const NewsDetail: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router

  return (
      <>
          {menuItems.map((item) => (
              console.log(item)
          ))}
      
    </>
  )
}

export default memo(NewsDetail)
