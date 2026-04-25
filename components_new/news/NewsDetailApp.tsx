import { getExtracted } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '../../i18n/navigation'

type NewsItem = {
  id: number | string
  name?: string
  name_uz?: string
  name_en?: string
  description?: string
  description_uz?: string
  description_en?: string
  asset?: Array<{ link: string }>
  [key: string]: unknown
}

type Props = {
  news: NewsItem
  relatedNews: NewsItem[]
  citySlug: string
  locale: string
}

const localizedName = (item: NewsItem, locale: string) => {
  if (locale === 'uz') return item.name_uz || ''
  if (locale === 'en') return item.name_en || ''
  return item.name || ''
}

const localizedDescription = (item: NewsItem, locale: string) => {
  if (locale === 'uz') return item.description_uz || ''
  if (locale === 'en') return item.description_en || ''
  return item.description || ''
}

export default async function NewsDetailApp({
  news,
  relatedNews,
  citySlug,
  locale,
}: Props) {
  const t = await getExtracted()
  const heroImg = news.asset?.[0]?.link || '/no_photo.svg'
  const heroAlt = localizedName(news, locale)
  const heroDesc = localizedDescription(news, locale)
  const heroHref = `/${citySlug}/news/${news.id}`

  return (
    <>
      <div>
        <div className="bg-white rounded-3xl flex p-5">
          <div>
            <Link href={heroHref} prefetch={false}>
              <Image src={heroImg} width={450} height={450} alt={heroAlt} />
            </Link>
          </div>
          <div className="ml-16 w-[430px]">
            <h1 id="news-headline" className="text-2xl">
              {heroAlt}
            </h1>
            <div
              id="news-summary"
              dangerouslySetInnerHTML={{ __html: heroDesc }}
            />
          </div>
        </div>
      </div>
      {relatedNews && relatedNews.length > 0 && (
        <>
          <div className="text-2xl mb-4 mt-10">
            {t('Рекомендованные новости')}
          </div>
          <div className="bg-white rounded-3xl flex justify-between p-4">
            <div className="md:grid md:grid-cols-3 gap-10 mx-5 md:mx-0">
              {relatedNews.map((item) => {
                const href = `/${citySlug}/news/${item.id}`
                const imgSrc = item.asset?.[0]?.link || '/no_photo.svg'
                const alt = localizedName(item, locale)
                return (
                  <div key={item.id}>
                    <div className="relative rounded-t-lg overflow-hidden">
                      <Link href={href} prefetch={false}>
                        <Image src={imgSrc} width={350} height={350} alt={alt} />
                      </Link>
                    </div>
                    <div className="flex flex-col justify-between p-5 flex-grow">
                      <div className="text-lg mb-3">
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
        </>
      )}
    </>
  )
}
