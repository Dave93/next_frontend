import { Layout } from '@components/common'
import commerce from '@lib/api/commerce'
import cookies from 'next-cookies'
import { GetServerSidePropsContext } from 'next'
import axios from 'axios'
import { ParsedUrlQuery } from 'querystring'


import getConfig from 'next/config'
import dynamic from 'next/dynamic'

const TrackClient = dynamic(() => import('./index.client').then((mod) => mod.default), { ssr: false })

interface IParams extends ParsedUrlQuery {
    id: string
  }
  
  const { publicRuntimeConfig } = getConfig()
  let webAddress = publicRuntimeConfig.apiUrl
  axios.defaults.withCredentials = true

export async function getServerSideProps({
    preview,
    locale,
    locales,
    params,
    query,
    ...context
  }: GetServerSidePropsContext) {
    const config = { locale, locales, queryParams: query }
    const productsPromise = commerce.getAllProducts({
      variables: { first: 6 },
      config,
      preview,
      // Saleor provider only
      ...({ featured: true } as any),
    })
    const pagesPromise = commerce.getAllPages({ config, preview })
    const siteInfoPromise = commerce.getSiteInfo({ config, preview })
    const { products } = await productsPromise
    const { pages } = await pagesPromise
    const { categories, brands, topMenu, footerInfoMenu, socials, currentCity } =
      await siteInfoPromise
    if (!currentCity) {
      return {
        notFound: true,
      }
    }
  
    const { id } = params as IParams
  
    const c = cookies(context)
  
    let otpToken: any = c['opt_token']
    c['user_token'] = otpToken
    axios.defaults.headers.get.Cookie = c
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    // console.log(axios.defaults.headers.common)
  
  
    return {
      props: {
        products,
        categories,
        brands,
        pages,
        currentCity,
        topMenu,
        footerInfoMenu,
        socials,
        orderId: id,
      },
    }
  }

export default function Track({
  orderId,
}: {
  orderId: string
}) {
  return <TrackClient orderId={orderId} />
}

Track.Layout = Layout