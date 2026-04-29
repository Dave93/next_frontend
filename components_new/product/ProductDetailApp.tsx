'use client'

import { FC } from 'react'
import { useRouter } from '../../i18n/navigation'
import ProductDetailContent from './ProductDetailContent'

type Props = {
  product: any
}

const ProductDetailApp: FC<Props> = ({ product }) => {
  const router = useRouter()

  return (
    <div className="container mx-auto py-4 md:py-6 px-3 md:px-0">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="back"
        className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <ProductDetailContent product={product} />
      </div>
    </div>
  )
}

export default ProductDetailApp
