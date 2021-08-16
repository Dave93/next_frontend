import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import NewsDetail from '@components_new/news/NewsDetail'
import cookies from 'next-cookies'
import axios from 'axios'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  params,
  ...context
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { categories, brands, topMenu, footerInfoMenu, socials, cities } =
    await siteInfoPromise
  const { id } = params
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
  console.log(activeCity)

  const { data } = await axios.get(
    `${process.env.API_URL}/api/news/public/${id}/?city_id=${activeCity.id}`
  )

  // console.log(data.data)

  if (!data.data.length) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      cleanBackground: true,
      cities,
      newsItem: data.data[0],
    },
  }
}

export default function NewsId() {
  return (
    <>
      <NewsDetail />
    </>
  )
}

NewsId.Layout = Layout
