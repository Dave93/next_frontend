import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { Product } from '@commerce/types/product'
import '@egjs/react-flicking/dist/flicking.css'
// import HomeAllProductsGrid from '@components/common/HomeAllProductsGrid'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import MainSlider from '@components_new/main/MainSlider'
import React, { useMemo } from 'react'
import ProductListSectionTitle from '@components_new/product/ProductListSectionTitle'
import ProductItemNew from '@components_new/product/ProductItemNew'
import SmallCart from '@components_new/common/SmallCart'
import CategoriesMenu from '@components_new/main/CategoriesMenu'
import SetLocation from '@components_new/header/SetLocation'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
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
    revalidate: 60,
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
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const readyProducts = useMemo(() => {
    const categories: CategoriesType = {}
    products.map((prod: Product) => {
      if (!categories[prod.categoryId]) {
        categories[prod.categoryId] = {
          id: prod.categoryId,
          name: prod.categoryName,
          items: [],
        }
      }
      categories[prod.categoryId].items.push(prod)
      return prod
    })
    return Object.values(categories)
  }, [products])

  return (
    <>
      <MainSlider />
      <div className="lg:hidden mx-8 my-5">
        <SetLocation />
      </div>
      <CategoriesMenu categories={categories} />
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-4 grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          <div className="col-span-3 space-y-16">
            {readyProducts.map((sec) => (
              <div key={sec.id} id={`productSection_${sec.id}`}>
                <ProductListSectionTitle title={sec.name} />
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-10">
                  {sec.items.map((prod) => (
                    <ProductItemNew product={prod} key={prod.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-20 sticky top-16 max-h-screen">
            <SmallCart />
          </div>
        </div>
      </div>
    </>
  )
}

Home.Layout = Layout
