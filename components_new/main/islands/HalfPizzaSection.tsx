'use client'

import { FC } from 'react'
import dynamic from 'next/dynamic'
import type { SlimSection } from '../../../lib/data/menu-dto'

// HalfPizza builder still operates on raw Product shape; we synthesize a
// minimal compatible object so the existing client component keeps working
// while we migrate it to SlimMenu in a follow-up phase.
const HalfPizzaApp = dynamic(
  () => import('../../product/CreateYourPizzaCommonApp'),
  { ssr: false }
)

type Props = {
  sections: SlimSection[]
  channelName: string
  isSmall?: boolean
}

function toLegacyProduct(item: any) {
  return {
    id: item.id,
    name: item.name,
    image: item.image,
    weight: item.weight,
    price: item.price,
    half_mode: true,
    attribute_data: {
      name: { chopar: { ru: item.name, uz: item.name, en: item.name } },
      description: item.description
        ? {
            chopar: {
              ru: item.description,
              uz: item.description,
              en: item.description,
            },
          }
        : undefined,
    },
    variants: (item.variants || []).map((v: any, idx: number) => ({
      id: v.id,
      price: v.price,
      weight: v.weight,
      active: idx === 1,
      modifiers: v.modifiers || [],
      attribute_data: {
        name: { chopar: { ru: v.name, uz: v.name, en: v.name } },
      },
      custom_name: v.name,
      custom_name_uz: v.name,
      custom_name_en: v.name,
    })),
  }
}

const HalfPizzaSection: FC<Props> = ({ sections, channelName, isSmall }) => {
  if (!sections.length) return null
  return (
    <>
      {sections.flatMap((sec) =>
        sec.items.map((item) => {
          const legacy = toLegacyProduct(item)
          return (
            <div
              key={item.id}
              className={
                isSmall
                  ? 'border border-yellow px-5 py-7 relative rounded-[15px] bg-white shadow-sm hover:shadow-xl overflow-hidden'
                  : 'border border-yellow p-3 mx-4 relative rounded-[15px] bg-white shadow-sm hover:shadow-xl'
              }
            >
              <HalfPizzaApp
                sec={legacy as any}
                channelName={channelName}
                isSmall={isSmall}
              />
            </div>
          )
        })
      )}
    </>
  )
}

export default HalfPizzaSection
