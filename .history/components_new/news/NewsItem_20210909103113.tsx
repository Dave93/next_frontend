import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import { ClockIcon, CalendarIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import { useRouter } from 'next/router'

type AnyObject = {
  [key: string]: any
}

type NewListProps = {
  newsItems: AnyObject[]
}

const NewsItem: FC<NewListProps> = ({ newsItems }) => {
  const router = useRouter()
  const { locale } = router
  return (
    <div className="mx-5 md:mx-0">
      {newsItems.map((item, key) => (
        <div
          className="bg-white rounded-3xl flex flex-col overflow-hidden"
          key={item.id}
        >
          <div className="relative">
            {item.asset && item.asset.length ? (
              <Link href={`${'/news/' + item.id}`} prefetch={false}>
                <a>
                  <Image
                    src={item.asset[0].link}
                    width="400"
                    height="400"
                    alt={locale == 'ru' ? item.name : item.name_uz}
                  />
                </a>
              </Link>
            ) : (
              <Link href={`${'/news/' + item.id}`} prefetch={false}>
                <a>
                  <Image
                    src="/no_photo.svg"
                    width="400"
                    height="400"
                    alt={locale == 'ru' ? item.name : item.name_uz}
                  />
                </a>
              </Link>
            )}

            {/* <div className="absolute bottom-5 flex justify-between px-4 text-white w-full">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                <div>22:00-03:00</div>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <div>01.07-31.07</div>
              </div>
            </div> */}
          </div>
          <div className="md:flex md:flex-col justify-between p-5 flex-grow">
            <div className="md:text-lg mb-3">
              <Link href={`${'/news/' + item.id}`} prefetch={false}>
                {locale == 'ru' ? item.name : item.name_uz}
              </Link>
            </div>
            <Link href={`${'/news/' + item.id}`} prefetch={false}>
              <a className="text-xs text-gray-400 hover:underline">
                Подробное описание
              </a>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export default memo(NewsItem)
