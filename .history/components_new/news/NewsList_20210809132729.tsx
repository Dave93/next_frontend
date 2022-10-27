import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import menuItems from '@commerce/data/newsMenu'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NewsItem from '../news/NewsItem'

const NewsList: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router

  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })

  return (
    <>
      <div className="flex items-center">
        {items.map((item, id) => (
          <div key={id} className="flex items-center ml-10">
            <img
              src={`${pathname == item.href ? item.activeIcon : item.icon}`}
            />
            <Link href={item.href} locale={locale} prefetch={false}>
              <a
                className={`${
                  pathname == item.href ? 'text-yellow' : 'text-gray-400'
                } ml-1 text-sm`}
              >
                {item.name}
              </a>
            </Link>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-10">
        <NewsItem />
      </div>
    </>
  )
}

export default memo(NewsList)
