import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import NewsDetail from '@components_new/news/NewsDetail'
import cookies from 'next-cookies'
import axios from 'axios'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { ClockIcon, CalendarIcon } from '@heroicons/react/solid'
import { ParsedUrlQuery } from 'querystring'

interface IParams extends ParsedUrlQuery {
  id: string
}

import menuItems from '@commerce/data/newsMenu'
import { useUI } from '@components/ui/context'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  params,
  query,
  ...context
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }
  const { id } = params as IParams
  const c = cookies(context)

  const { data } = await axios.get(
    `${process.env.API_URL}/api/sales/public/${id}/?city_id=${currentCity.id}`
  )

  if (!data.data.length) {
    return {
      notFound: true,
    }
  }

  const { data: relatedData } = await axios.get(
    `${process.env.API_URL}/api/sales/related/${id}/?city_id=${currentCity.id}&locale=${locale}`
  )

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      currentCity,
      cleanBackground: true,
      cities,
      SaleItem: data.data[0],
      relatedSale: relatedData.data,
    },
  }
}

export default function SaleId({
  SaleItem,
  relatedSale,
}: {
  SaleItem: any
  relatedSale: any
}) {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { activeCity } = useUI()
  const { locale, pathname } = router
  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })
  return (
    <>
      <div>
        <div className="flex items-center justify-center my-10">
          {items.map((item, id) => {
            let href = `${item.href}`

            if (href.indexOf('http') < 0) {
              href = `/${activeCity.slug}${item.href}`
            }
            return (
              <div key={id} className="flex items-center ml-10">
                <img
                  src={`${
                    pathname.indexOf(item.href) >= 0
                      ? item.activeIcon
                      : item.icon
                  }`}
                />
                <Link
                  href={href}
                  locale={locale}
                  prefetch={false}
                  legacyBehavior
                >
                  <a
                    className={`${
                      pathname.indexOf(item.href) >= 0
                        ? 'text-yellow'
                        : 'text-gray-400'
                    } ml-1 text-sm`}
                  >
                    {item.name}
                  </a>
                </Link>
              </div>
            )
          })}
        </div>
        <div className="bg-white rounded-3xl flex p-5">
          <div className="">
            {SaleItem.asset && SaleItem.asset.length ? (
              <Link
                href={`${'/' + activeCity.slug + '/sale/' + SaleItem.id}`}
                prefetch={false}
                legacyBehavior
              >
                <a>
                  <Image
                    src={SaleItem.asset[0].link}
                    width="450"
                    height="450"
                    alt={SaleItem.name}
                  />
                </a>
              </Link>
            ) : (
              <Link
                href={`${'/' + activeCity.slug + '/sale/' + SaleItem.id}`}
                prefetch={false}
                legacyBehavior
              >
                <a>
                  <Image
                    src="/no_photo.svg"
                    width="450"
                    height="450"
                    alt={SaleItem.name}
                  />
                </a>
              </Link>
            )}
          </div>
          <div className="ml-16 w-[430px]">
            <div className="text-2xl">{SaleItem.name}</div>
            {/* <div className="text-sm text-gray-400 mb-8">{SaleItem.}</div> */}
            <div
              dangerouslySetInnerHTML={{
                __html: SaleItem.description,
              }}
            ></div>
          </div>
        </div>
      </div>
      {relatedSale.length && relatedSale.length > 0 && (
        <>
          <div className="text-2xl mb-4 mt-10">{tr('recommended_sales')}</div>
          <div className="bg-white rounded-3xl flex justify-between p-4">
            <div className="md:grid grid-cols-3 gap-10 mx-5 md:mx-0">
              {relatedSale.map((item: any) => (
                <div key={item.id}>
                  <div className="relative rounded-t-lg overflow-hidden">
                    {item.asset && item.asset.length ? (
                      <Link
                        href={`${'/' + activeCity.slug + '/sale/' + item.id}`}
                        prefetch={false}
                        legacyBehavior
                      >
                        <a>
                          <Image
                            src={item.asset[0].link}
                            width="350"
                            height="350"
                            alt={item.name}
                          />
                        </a>
                      </Link>
                    ) : (
                      <Link
                        href={`${'/' + activeCity.slug + '/sale/' + item.id}`}
                        prefetch={false}
                        legacyBehavior
                      >
                        <a>
                          <Image
                            src="/no_photo.svg"
                            width="350"
                            height="350"
                            alt={item.name}
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
                  <div className="flex flex-col justify-between p-5 flex-grow">
                    <div className="text-lg mb-3">
                      <Link
                        href={`${'/' + activeCity.slug + '/sale/' + item.id}`}
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </div>
                    <Link
                      href={`${'/' + activeCity.slug + '/sale/' + item.id}`}
                      prefetch={false}
                      legacyBehavior
                    >
                      <a className="text-xs text-gray-400 hover:underline">
                        {tr('more')}
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

SaleId.Layout = Layout
