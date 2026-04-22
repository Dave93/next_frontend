'use client'

import { FC } from 'react'
import { useLocale } from 'next-intl'
import ProductItemNewApp from './ProductItemNewApp'

type Props = {
  product: any
  channelName: string
}

const ProductDetailApp: FC<Props> = ({ product, channelName }) => {
  const locale = useLocale()

  const localizedName = (() => {
    const attrName =
      product?.attribute_data?.name?.['chopar']?.[locale] ||
      product?.attribute_data?.name?.['chopar']?.['ru']
    return attrName || product?.name || ''
  })()

  const localizedDesc = (() => {
    const attrDesc =
      product?.attribute_data?.description?.['chopar']?.[locale] ||
      product?.attribute_data?.description?.['chopar']?.['ru']
    return attrDesc || product?.description || ''
  })()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl mb-4">{localizedName}</h1>
      {localizedDesc && (
        <div
          className="prose mb-8"
          dangerouslySetInnerHTML={{ __html: localizedDesc }}
        />
      )}
      <div className="md:max-w-md">
        <ProductItemNewApp product={product} channelName={channelName} />
      </div>
    </div>
  )
}

export default ProductDetailApp
