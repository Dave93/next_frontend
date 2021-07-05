import React, { memo, useState, useContext, FC, useMemo } from 'react'
import Image from 'next/image'
import ProductOptionSelector from './ProductOptionSelector'
import currency from 'currency.js'
import {
  Product,
  ProductOptionValues,
  ProductPrice,
} from '@commerce/types/product'
import useTranslation from 'next-translate/useTranslation'
// import SessionContext from 'react-storefront/session/SessionContext'

type ProductItem = {
  product: Product
}

const ProductItemNew: FC<ProductItem> = ({ product }) => {
  const { t: tr } = useTranslation('common')
  // console.log('product', product)
  const [store, updateStore] = useState(product)
  // const { actions } = useContext(SessionContext)
  const [addToCartInProgress, setAddToCartInProgress] = useState(false)

  const updateOptionSelection = (optionId: string, valueId: string) => {
    const prod = store
    prod.options = prod.options.map((option) => {
      if (option.id == optionId) {
        option.values = option.values.map((v) => {
          if (v.id == valueId) {
            v.active = true
          } else {
            v.active = false
          }
          return v
        })
      }
      return option
    })
    // console.log(prod)
    updateStore({ ...prod })
  }

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault() // prevent the page location from changing
    setAddToCartInProgress(true) // disable the add to cart button until the request is finished

    try {
      // send the data to the server
      // await actions.addToCart({
      //   product: store,
      //   quantity: 1,
      //   size: store.size.id,
      // })
      // open the confirmation dialog
      // setConfirmationOpen(true)
    } finally {
      // re-enable the add to cart button
      setAddToCartInProgress(false)
    }
  }

  const totalPrice = useMemo(() => {
    let price: number = store.price?.value || 0
    if (store.options && store.options.length > 0) {
      store.options.map((option) => {
        const activeValue: ProductOptionValues = option.values.find(
          (item) => item.active == true
        ) as ProductOptionValues
        price += activeValue.price.value
      })
    }
    return price
  }, [store.price, store.options])

  return (
    <div className="md:flex md:flex-col flex">
      <div>
        <div className="text-center">
          {store.image ? (
            <Image
              src={store.image}
              width={250}
              height={250}
              alt={store.name}
            />
          ) : (
            <Image
              src="/no_photo.svg"
              width={250}
              height={250}
              alt={store.name}
              className="rounded-full"
            />
          )}
        </div>
      </div>
      <div>
        <div className="font-black mt-4 text-xl">{store.name}</div>
        {store.sizeDesc && (
          <div className="font-bold mt-2 text-gray-700 text-xs">
            {store.sizeDesc}
          </div>
        )}
        <div className="mt-1 text-xs flex-grow">{store.description}</div>
        <div className="hidden md:block">
          {store.options &&
            store.options.length > 0 &&
            store.options.map((option) => (
              <ProductOptionSelector
                key={option.id}
                option={option}
                onChange={updateOptionSelection}
              />
            ))}
        </div>
        <div className="mt-10 flex justify-between items-center">
          <button
            className="bg-yellow focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-white uppercase md:inline-flex items-center hidden"
            onClick={handleSubmit}
            disabled={addToCartInProgress}
          >
            {addToCartInProgress && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {tr('main_to_basket')}
          </button>
          <span className="text-xl">
            {currency(totalPrice, {
              pattern: '# !',
              separator: ' ',
              decimal: ',',
              symbol: 'сўм',
              precision: 0,
            }).format()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(ProductItemNew)
