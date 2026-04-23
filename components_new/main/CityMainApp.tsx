'use client'

import { useMemo, FC } from 'react'
import MainSliderApp from './MainSliderApp'
import CategoriesMenuApp from './CategoriesMenuApp'
import MobileCategoriesMenuApp from './MobileCategoriesMenuApp'
import ProductItemNewApp from '../product/ProductItemNewApp'
import ProductListSectionTitle from '../product/ProductListSectionTitle'
import MobSetLocationApp from '../header/MobSetLocationApp'
import ThreePizzaApp from './ThreePizzaApp'
import { useLocale } from 'next-intl'

type Props = {
  products: any[]
  categories: any[]
  sliders: any[]
  channelName: string
}

const CityMainApp: FC<Props> = ({
  products,
  categories,
  sliders,
  channelName,
}) => {
  const locale = useLocale()

  const categoryName = (cat: any): string => {
    const fromAttr =
      cat?.attribute_data?.name?.['chopar']?.[locale] ||
      cat?.attribute_data?.name?.['chopar']?.['ru']
    return fromAttr || cat?.name || ''
  }

  const threeCategories = useMemo(() => {
    const res: any[] = []
    for (const prod of products || []) {
      if (prod.items) {
        for (const item of prod.items) {
          if (item.variants?.length) {
            for (const v of item.variants) {
              if (v.threesome) res.push(v)
            }
          } else if (item.threesome) {
            res.push(item)
          }
        }
      } else if (prod.variants?.length) {
        for (const v of prod.variants) {
          if (v.threesome) res.push(v)
        }
      } else if (prod.threesome) {
        res.push(prod)
      }
    }
    return res
  }, [products])

  // The /products/public endpoint returns root categories with their items
  // already grouped — no need to map by category_id ourselves. Fall back to
  // siteInfo categories only when products payload is empty.
  const sections = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) {
      return products
        .filter((cat: any) => Array.isArray(cat.items) && cat.items.length > 0)
        .map((cat: any) => ({
          id: cat.id,
          title: categoryName(cat),
          items: cat.items,
        }))
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, locale])

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
      {threeCategories.length > 0 && (
        <ThreePizzaApp items={threeCategories} channelName={channelName} />
      )}
      <div className="container mx-auto py-4">
        {sections.map((section) => (
          <section
            id={`productSection_${section.id}`}
            key={section.id}
            className="mb-10"
          >
            <ProductListSectionTitle title={section.title} />
            <div className="md:grid md:grid-cols-3 gap-6">
              {section.items.map((product: any) => (
                <ProductItemNewApp
                  key={product.id}
                  product={product}
                  channelName={channelName}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

export default CityMainApp
