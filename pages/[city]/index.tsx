import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { Product } from '@commerce/types/product'
import '@egjs/react-flicking/dist/flicking.css'
// import HomeAllProductsGrid from '@components/common/HomeAllProductsGrid'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import { useRouter } from 'next/router'
import MainSlider from '@components_new/main/MainSlider'
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import ProductListSectionTitle from '@components_new/product/ProductListSectionTitle'
import ProductItemNew from '@components_new/product/ProductItemNew'
import CategoriesMenu from '@components_new/main/CategoriesMenu'
import MobSetLocation from '@components_new/header/MobSetLocation'
import defaultChannel from '@lib/defaultChannel'
import dynamic from 'next/dynamic'
import { NextSeo } from 'next-seo'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import axios from 'axios'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

let webAddress = publicRuntimeConfig.apiUrl

const HalfPizzaNoSSR = dynamic(
  () => import('@components_new/product/CreateYourPizzaCommon'),
  { ssr: false }
)

const CartWithNoSSR = dynamic(
  () => import('@components_new/common/SmallCart'),
  { ssr: false }
)
const MobileCartWithNoSSR = dynamic(
  () => import('@components_new/common/SmallCartMobile'),
  { ssr: false }
)

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
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
  const { products }: { products: any[] } = await productsPromise
  const { pages } = await pagesPromise

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

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
      cities,
      currentCity,
      cleanBackground: true,
    },
  }
}

interface Category {
  id: string
  name: string
  items: Product[]
}

interface CategoriesType {
  [key: string]: Category
}

export default function Home({
  products,
  categories,
}: {
  products: any[]
  categories: any[]
}) {
  const router = useRouter()
  const { locale } = router
  const [channelName, setChannelName] = useState('chopar')
  const [isStickySmall, setIsStickySmall] = useState(false)
  const { t: tr } = useTranslation('common')
  const {
    setCitiesData,
    activeCity,
    setActiveCity,
    openLocationTabs,
    openMobileLocationTabs,
    setStopProducts,
    locationData,
  } = useUI()

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const hideCreatePizza = (e: any) => {
    if (window.scrollY > 500) {
      setIsStickySmall(true)
    } else {
      setIsStickySmall(false)
    }
  }

  const showLocationTabsController = async () => {
    if (locationData?.terminalData) {
      const { data: terminalStock } = await axios.get(
        `${webAddress}/api/terminals/get_stock?terminal_id=${locationData?.terminalData.id}`
      )

      if (!terminalStock.success) {
        return
      } else {
        setStopProducts(terminalStock.data)
      }
      return
    }

    setTimeout(() => {
      if (window.innerWidth < 768) {
        openMobileLocationTabs()
      } else {
        openLocationTabs()
      }
    }, 400)
  }

  useEffect(() => {
    getChannel()

    window.addEventListener('scroll', hideCreatePizza)

    showLocationTabsController()
    return () => {
      window.removeEventListener('scroll', hideCreatePizza)
    }
    // return () => document.removeEventListener('sticky-change', handleKeyUp)
  }, [locationData])

  const readyProducts = useMemo(() => {
    return products
      .map((prod: any) => {
        if (prod.half_mode) {
          return null
        }
        if (prod.variants && prod.variants.length) {
          prod.variants = prod.variants.map((v: any, index: number) => {
            if (index === 1) {
              v.active = true
            } else {
              v.active = false
            }

            return v
          })
        } else if (prod.items && prod.items.length) {
          prod.items = prod.items.map((item: any) => {
            item.variants = item.variants.map((v: any, index: number) => {
              if (index === 1) {
                v.active = true
              } else {
                v.active = false
              }

              return v
            })

            return item
          })
        }
        return prod
      })
      .filter((prod: any) => prod != null)
  }, [products])

  const halfModeProds = useMemo(() => {
    return products
      .map((prod: any) => {
        if (!prod.half_mode) {
          return null
        }
        if (prod.variants && prod.variants.length) {
          prod.variants = prod.variants.map((v: any, index: number) => {
            if (index === 1) {
              v.active = true
            } else {
              v.active = false
            }

            return v
          })
        } else if (prod.items && prod.items.length) {
          prod.items = prod.items.map((item: any) => {
            item.variants = item.variants.map((v: any, index: number) => {
              if (index === 1) {
                v.active = true
              } else {
                v.active = false
              }

              return v
            })

            return item
          })
        }
        return prod
      })
      .filter((prod: any) => prod != null)
  }, [products])

  return (
    <>
      <NextSeo
        title="Заказать пиццу с доставкой в Ташкенте | Chopar Pizza"
        description="Бесплатная доставка пиццы в Ташкенте, заказать можно на нашем сайте или позвонив по номеру телефона +998 71 205-11-11 | Chopar Pizza"
      />
      <MainSlider />
      <div className="lg:hidden mx-8 my-5">
        <MobSetLocation />
      </div>
      <CategoriesMenu categories={categories} channelName={channelName} />
      <div className="container mx-auto">
        <h1 className="py-1 md:text-4xl text-2xl w-max my-10 m-auto">
          {tr('pizza_for_family_' + activeCity.slug)}
        </h1>
        <div className="grid lg:grid-cols-4 grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          <div className="col-span-3 md:hidden">
            {halfModeProds.map((sec: any) => (
              <div
                key={sec.id}
                className="border border-yellow mt-4 p-3 mx-4 relative rounded-[15px] bg-white shadow-sm hover:shadow-xl"
              >
                <HalfPizzaNoSSR sec={sec} channelName={channelName} />
              </div>
            ))}
          </div>
          <div className="col-span-3 space-y-16">
            {readyProducts.map((sec: any) =>
              sec.half_mode ? (
                <div
                  key={sec.id}
                  className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md:gap-10 divide-y md:divide-y-0 px-4 md:px-0"
                >
                  <HalfPizzaNoSSR sec={sec} channelName={channelName} />
                </div>
              ) : (
                <div key={sec.id} id={`productSection_${sec.id}`}>
                  <ProductListSectionTitle
                    title={
                      sec?.attribute_data?.name[channelName][locale || 'ru']
                    }
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md:gap-3 divide-y md:divide-y-0 px-4 md:px-0 space-y-3 md:space-y-0">
                    {sec.items.map((prod: any) => (
                      <ProductItemNew
                        product={prod}
                        key={prod.id}
                        channelName={channelName}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
          <div
            className={`mt-[71px] sticky ${
              isStickySmall ? 'top-[21px]' : 'top-16'
            } max-h-screen hidden md:block`}
          >
            {halfModeProds.map((sec: any) => (
              <div
                key={sec.id}
                className="border transition-all overflow-hidden duration-500 border-yellow mt-4 px-5 py-7 relative rounded-[15px] bg-white shadow-sm hover:shadow-xl"
              >
                <HalfPizzaNoSSR
                  sec={sec}
                  channelName={channelName}
                  isSmall={isStickySmall}
                />
              </div>
            ))}
            <CartWithNoSSR channelName={channelName} />
          </div>
        </div>
      </div>
      <MobileCartWithNoSSR />
    </>
  )
}

Home.Layout = Layout
