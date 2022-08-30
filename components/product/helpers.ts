import type { Product, ProductOption } from '@commerce/types/product'
export type SelectedOptions = Record<string, string | null>
import { Dispatch, SetStateAction } from 'react'

export function selectDefaultOptionFromProduct(
  product: Product,
  updater: Dispatch<SetStateAction<SelectedOptions>>
) {
  if (product.variants) {
    const { options }: { options: ProductOption[] } = product.variants[0]
    // Selects the default option
    options.forEach((v: ProductOption) => {
      updater((choices) => ({
        ...choices,
        [v.displayName.toLowerCase()]: v.values[0].label.toLowerCase(),
      }))
    })
  }
}
