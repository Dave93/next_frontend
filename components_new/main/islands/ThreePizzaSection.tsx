'use client'

import { FC, useMemo } from 'react'
import ThreePizzaApp from '../ThreePizzaApp'
import type { SlimSection } from '../../../lib/data/menu-dto'

type Props = {
  sections: SlimSection[]
  channelName: string
}

// Adapt SlimMenu shape into the legacy Product[] shape ThreePizzaApp expects.
function flattenThreesomeItems(sections: SlimSection[]): any[] {
  const result: any[] = []
  for (const sec of sections) {
    for (const item of sec.items) {
      const variants = item.variants || []
      if (variants.length) {
        for (const v of variants) {
          result.push({
            id: v.id,
            price: v.price,
            weight: v.weight,
            attribute_data: {
              name: { chopar: { ru: v.name, uz: v.name, en: v.name } },
            },
            asset: item.image
              ? {
                  location: '',
                  filename: '',
                }
              : undefined,
            image: item.image,
            modifiers: v.modifiers || [],
            custom_name: v.name,
            custom_name_uz: v.name,
            custom_name_en: v.name,
          })
        }
      } else if (item.threesome) {
        result.push({
          id: item.id,
          price: item.price,
          weight: item.weight,
          attribute_data: {
            name: { chopar: { ru: item.name, uz: item.name, en: item.name } },
          },
          image: item.image,
          modifiers: item.modifiers || [],
          custom_name: item.name,
        })
      }
    }
  }
  return result
}

const ThreePizzaSection: FC<Props> = ({ sections, channelName }) => {
  const items = useMemo(() => flattenThreesomeItems(sections), [sections])
  if (!items.length) return null
  return <ThreePizzaApp items={items as any} channelName={channelName} />
}

export default ThreePizzaSection
