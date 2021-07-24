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
import React, { useEffect, useMemo, useState } from 'react'
import ProductListSectionTitle from '@components_new/product/ProductListSectionTitle'
import ProductItemNew from '@components_new/product/ProductItemNew'
import SmallCart from '@components_new/common/SmallCart'
import CategoriesMenu from '@components_new/main/CategoriesMenu'
import SetLocation from '@components_new/header/SetLocation'
import MobSetLocation from '@components_new/header/MobSetLocation'
import defaultChannel from '@lib/defaultChannel'

export async function getServerSideProps({
  preview,
  locale,
  locales,
}: GetServerSidePropsContext) {
  const config = { locale, locales }
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
  const { categories, brands, topMenu, footerInfoMenu, socials } =
    await siteInfoPromise

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
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
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const { locale } = router
  const [channelName, setChannelName] = useState('chopar')

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  useEffect(() => {
    getChannel()
  }, [])
console.log(channelName)
  const readyProducts = useMemo(() => {
    return products.map((prod: any) => {
      if (prod.variants && prod.variants.length) {
        prod.variants = prod.variants.map((v: any, index: number) => {
          if (index === 0) {
            v.active = true
          } else {
            v.active = false
          }

          return v
        })
      } else if (prod.items && prod.items.length) {
        prod.items = prod.items.map((item: any) => {
          item.variants = item.variants.map((v: any, index: number) => {
            if (index === 0) {
              v.active = true
            } else {
              v.active = false
            }
            if (v.modifiers && v.modifiers.length) {
              v.modifiers = v.modifiers.map((mod: any) => {
                if (mod.price == 0) {
                  mod.active = true
                } else {
                  mod.active = false
                }
                return mod
              })
            }

            return v
          })

          if (!item.variants.length) {
            if (item.modifiers && item.modifiers.length) {
              item.modifiers = item.modifiers.map((mod: any) => {
                if (mod.price == 0) {
                  mod.active = true
                } else {
                  mod.active = false
                }
                return mod
              })
            }
          }

          return item
        })
      }
      return prod
    })
  }, [products])
console.log()
  return (
    <>
      <MainSlider />
      <div className="lg:hidden mx-8 my-5">
        <MobSetLocation />
      </div>
      {channelName && (
        <CategoriesMenu categories={categories} channelName={channelName} />
      )}
      {channelName}
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-4 grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          <div className="col-span-3 space-y-16">
            {channelName && readyProducts.map((sec: any) => (
              <div key={sec.id} id={`productSection_${sec.id}`}>
                <pre>{JSON.stringify(sec)}</pre>
                <ProductListSectionTitle
                  title={sec?.attribute_data?.name[channelName][locale || 'ru']}
                />
                {/* <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md:gap-10 divide-y md:divide-y-0 px-4 md:px-0">
                  {sec.items.map((prod: any) => (
                    <ProductItemNew
                      product={prod}
                      key={prod.id}
                      channelName={channelName}
                    />
                  ))}
                </div> */}
              </div>
            ))}
          </div>
          <div className="mt-20 sticky top-16 max-h-screen hidden md:block">
            <SmallCart />
          </div>
        </div>
      </div>
    </>
  )
}

Home.Layout = Layout
