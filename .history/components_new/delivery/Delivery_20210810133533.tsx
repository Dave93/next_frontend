import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import menuItems from '@commerce/data/newsMenu'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NewsItem from '../news/NewsItem'

const Delivery: FC = () => {
    return (
      <>
        <div>Доставка в Chopar Pizza ежедневно с 10:00 до 03:00 </div>
      </>
    )
}

export default memo(Delivery)