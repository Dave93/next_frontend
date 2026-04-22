'use client'

import { useMemo, FC } from 'react'
import dynamic from 'next/dynamic'
import MainSliderApp from './MainSliderApp'
import CategoriesMenuApp from './CategoriesMenuApp'
import MobileCategoriesMenuApp from './MobileCategoriesMenuApp'
import ProductItemNewApp from '../product/ProductItemNewApp'
import ProductListSectionTitle from '../product/ProductListSectionTitle'
import MobSetLocationApp from '../header/MobSetLocationApp'
import { useLocale } from 'next-intl'

const ThreePizzaApp = dynamic(() => import('./ThreePizzaApp'), { ssr: false })

type Props = {
  products: any[]
  categories: any[]
  sliders: any[]
  channelName: string
}

const CityMainApp: FC<Props> = ({ products, categories, sliders, channelName }) => {
  const locale = useLocale()

  // Group products by category id (port from legacy pages/[city]/index.tsx)
  const productsByCategory = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const prod of products) {
      const catId = String(prod.category_id ?? prod.categoryId ?? 'misc')
      if (!map[catId]) map[catId] = []
      map[catId].push(prod)
    }
    return map
  }, [products])

  const categoryName = (cat: any): string => {
    const fromAttr =
      cat?.attribute_data?.name?.['chopar']?.[locale] ||
      cat?.attribute_data?.name?.['chopar']?.['ru']
    return fromAttr || cat?.name || ''
  }

  return (
    <>
      <div className="md:hidden">
        <MobSetLocationApp />
      </div>
      <MainSliderApp initialSliders={sliders} />
      <div id="header" />
      <div className="hidden md:block">
        <CategoriesMenuApp categories={categories} channelName={channelName} />
      </div>
      <div className="md:hidden">
        <MobileCategoriesMenuApp categories={categories} />
      </div>
      <ThreePizzaApp items={[]} channelName={channelName} />
      <div className="container mx-auto py-4">
        {categories.map((cat) => {
          const items = productsByCategory[String(cat.id)] || []
          if (!items.length) return null
          return (
            <section
              id={`productSection_${cat.id}`}
              key={cat.id}
              className="mb-10"
            >
              <ProductListSectionTitle title={categoryName(cat)} />
              <div className="md:grid md:grid-cols-3 gap-6">
                {items.map((product) => (
                  <ProductItemNewApp
                    key={product.id}
                    product={product}
                    channelName={channelName}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}

export default CityMainApp
