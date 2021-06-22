import type { Product, ProductOption } from '@commerce/types/product'
export type SelectedOptions = Record<string, string | null>
import { Dispatch, SetStateAction } from 'react'

export function getProductVariant(product: Product, opts: SelectedOptions) {
  const variant = product.variants?.find((variant) => {
    return Object.entries(opts).every(([key, value]) =>
      variant.options.find((option) => {
        if (
          option.__typename === 'MultipleChoiceOption' &&
          option.displayName.toLowerCase() === key.toLowerCase()
        ) {
          return option.values.find((v) => v.label.toLowerCase() === value)
        }
      })
    )
  })
  return variant
}

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
