import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import cookies from 'next-cookies'
import axios from 'axios'
import menuItems from '@commerce/data/newsMenu'
import Link from 'next/link'
import { useRouter } from 'next/router'
import SaleItem from '@components_new/sale/SaleItem'
import useTranslation from 'next-translate/useTranslation'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  ...context
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { categories, brands, topMenu, footerInfoMenu, socials, cities } =
    await siteInfoPromise

  const c = cookies(context)

  let activeCity = null

  let activeCityData: any = c.activeCity
  try {
    activeCityData = Buffer.from(activeCityData, 'base64')
    activeCityData = activeCityData.toString()
    activeCityData = JSON.parse(activeCityData)
  } catch (e) {}

  activeCity = activeCityData

  if (!activeCity) {
    activeCity = cities[0]
  }

  const { data } = await axios.get(
    `${process.env.API_URL}/api/sales/public?city_id=${activeCity.id}`
  )

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      cleanBackground: true,
      cities,
      sale: data.data,
    },
  }
}

export default function Sale({ sale }: { sale: any }) {
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
      <div className="flex items-center justify-center md:my-10 space-x-6 py-6 md:py-0">
        {items.map((item, id) => (
          <div key={id} className="flex items-center md:ml-10 ">
            <img
              src={`${
                pathname.indexOf(item.href) >= 0 ? item.activeIcon : item.icon
              }`}
            />
            <Link href={item.href} locale={locale} prefetch={false}>
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
        ))}
      </div>
      <div className="md:grid grid-cols-3 gap-10 mx-5 md:mx-0">
        <SaleItem SaleItems={sale} />
        {sale.length < 0 } asdasdasd
      </div>
    </>
  )
}

Sale.Layout = Layout
