import { getExtracted } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

type NewsItem = {
  id: number | string
  name?: string
  name_uz?: string
  name_en?: string
  asset?: Array<{ link: string }>
  [key: string]: unknown
}

type Props = {
  news: NewsItem[]
  citySlug: string
  locale: string
}

const localizedName = (item: NewsItem, locale: string) => {
  if (locale === 'uz') return item.name_uz || ''
  if (locale === 'en') return item.name_en || ''
  return item.name || ''
}

export default async function NewsListApp({ news, citySlug, locale }: Props) {
  const t = await getExtracted()

  if (!news.length) {
    return (
      <div className="mx-5 md:mx-0">
        <div className="text-3xl mb-1">{t('Новости')}</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
        <div className="text-2xl text-center">{t('Пока новостей нет')}</div>
      </div>
    )
  }

  return (
    <div className="mx-5 md:mx-0">
      <div className="text-3xl mb-1">{t('Новости')}</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="md:grid md:grid-cols-3 gap-10 mb-8">
        {news.map((item) => {
          const href = `/${citySlug}/news/${item.id}`
          const imgSrc = item.asset?.[0]?.link || '/no_photo.svg'
          const alt = localizedName(item, locale)
          return (
            <div
              className="bg-white rounded-3xl flex flex-col overflow-hidden mb-4 md:mb-0"
              key={item.id}
            >
              <div className="relative">
                <Link href={href} prefetch={false}>
                  <Image src={imgSrc} width={400} height={400} alt={alt} />
                </Link>
              </div>
              <div className="md:flex md:flex-col justify-between p-5 flex-grow">
                <div className="md:text-lg mb-3">
                  <Link href={href} prefetch={false}>
                    {alt}
                  </Link>
                </div>
                <Link
                  href={href}
                  prefetch={false}
                  className="text-xs text-gray-400 hover:underline"
                >
                  {t('Подробнее')}
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
