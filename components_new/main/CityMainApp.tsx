'use client'

import { useMemo, FC } from 'react'
import dynamic from 'next/dynamic'
import MainSliderApp from './MainSliderApp'
import CategoriesMenuApp from './CategoriesMenuApp'
import MobileCategoriesMenuApp from './MobileCategoriesMenuApp'
import ProductItemNewApp from '../product/ProductItemNewApp'
import ProductListSectionTitle from '../product/ProductListSectionTitle'
import MobSetLocationApp from '../header/MobSetLocationApp'
import ThreePizzaApp from './ThreePizzaApp'
import SmallCartApp from '../common/SmallCartApp'
import { useLocale } from 'next-intl'
import { useUI } from '@components/ui/context'

// Pizza-50/50 builder is desktop+mobile via internal switch — load client-only.
const HalfPizzaApp = dynamic(
  () => import('../product/CreateYourPizzaCommonApp'),
  { ssr: false }
)

type Props = {
  products: any[]
  categories: any[]
  sliders: any[]
  channelName: string
}

const cityHeading: Record<string, Record<string, string>> = {
  tashkent: {
    ru: 'Пицца для всей семьи в Ташкенте',
    uz: 'Toshkentdagi butun oila uchun pitsa',
    en: 'Pizza for the whole family in Tashkent',
  },
  samarkand: {
    ru: 'Пицца для всей семьи в Самарканде',
    uz: 'Samarqanddagi butun oila uchun pitsa',
    en: 'Pizza for the whole family in Samarkand',
  },
}

const CityMainApp: FC<Props> = ({
  products,
  categories,
  sliders,
  channelName,
}) => {
  const locale = useLocale()
  const { activeCity } = useUI()

  const heading = useMemo(() => {
    const slug = activeCity?.slug || 'tashkent'
    return (
      cityHeading[slug]?.[locale] ||
      cityHeading[slug]?.ru ||
      cityHeading.tashkent[locale] ||
      cityHeading.tashkent.ru
    )
  }, [activeCity, locale])

  const categoryName = (cat: any): string => {
    const fromAttr =
      cat?.attribute_data?.name?.['chopar']?.[locale] ||
      cat?.attribute_data?.name?.['chopar']?.['ru']
    return fromAttr || cat?.name || ''
  }

  // 50/50 categories: legacy renders these via the HalfPizza builder both
  // inline (mobile) and inside the right-rail sticky column (desktop).
  // Mark variant index 1 as the default size (matches legacy behaviour).
  const halfModeProds = useMemo(() => {
    return (products || [])
      .map((prod: any) => {
        if (!prod.half_mode) return null
        const next = { ...prod }
        if (next.variants?.length) {
          next.variants = next.variants.map((v: any, i: number) => ({
            ...v,
            active: i === 1,
          }))
        } else if (next.items?.length) {
          next.items = next.items.map((item: any) => ({
            ...item,
            variants: (item.variants || []).map((v: any, i: number) => ({
              ...v,
              active: i === 1,
            })),
          }))
        }
        return next
      })
      .filter((p: any) => p !== null)
  }, [products])

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

  const sections = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) {
      return products
        .filter(
          (cat: any) =>
            !cat.half_mode &&
            Array.isArray(cat.items) &&
            cat.items.length > 0
        )
        .map((cat: any) => ({
          id: cat.id,
          title: categoryName(cat),
          items: cat.items,
          desc:
            locale === 'uz'
              ? cat.desc_uz
              : locale === 'en'
              ? (cat as any).desc_en
              : cat.desc,
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
      <div className="container mx-auto">
        <h1 className="py-1 md:text-4xl text-2xl w-max mt-4 mb-10 md:my-10 m-auto">
          {heading}
        </h1>
        <div className="grid lg:grid-cols-4 grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          {threeCategories.length > 0 && (
            <div className="col-span-3 md:hidden">
              <ThreePizzaApp
                items={threeCategories}
                channelName={channelName}
              />
            </div>
          )}
          {halfModeProds.length > 0 && (
            <div className="col-span-3 md:hidden space-y-4">
              {halfModeProds.map((sec: any) => (
                <div
                  key={sec.id}
                  className="border border-yellow p-3 mx-4 relative rounded-[15px] bg-white shadow-sm hover:shadow-xl"
                >
                  <HalfPizzaApp sec={sec} channelName={channelName} />
                </div>
              ))}
            </div>
          )}
          <div className="col-span-3 space-y-16">
            {threeCategories.length > 0 && (
              <div className="hidden md:block">
                <ThreePizzaApp
                  items={threeCategories}
                  channelName={channelName}
                />
              </div>
            )}
            {sections.map((section) => (
              <div key={section.id} id={`productSection_${section.id}`}>
                <ProductListSectionTitle title={section.title} />
                <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 gap-2.5 md:gap-3 px-4 md:px-0">
                  {section.items.map((product: any) => (
                    <ProductItemNewApp
                      key={product.id}
                      product={product}
                      channelName={channelName}
                    />
                  ))}
                </div>
                {section.desc && (
                  <div className="mt-5 px-4 md:px-0">
                    <p>{section.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="sticky top-16 max-h-screen hidden md:block space-y-4">
            {halfModeProds.map((sec: any) => (
              <div
                key={sec.id}
                className="border border-yellow px-5 py-7 relative rounded-[15px] bg-white shadow-sm hover:shadow-xl overflow-hidden"
              >
                <HalfPizzaApp sec={sec} channelName={channelName} isSmall />
              </div>
            ))}
            <SmallCartApp channelName={channelName} />
          </div>
        </div>
      </div>
    </>
  )
}

export default CityMainApp
