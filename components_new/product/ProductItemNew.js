import React, { memo, useState, useContext } from 'react'
import Image from 'next/image'
import ProductOptionSelector from 'react-storefront/option/ProductOptionSelector'
import ProductOption from './ProductOption'
import currency from 'currency.js'
import SessionContext from 'react-storefront/session/SessionContext'

function ProductItemNew({ product, sizeSelector }) {
  // console.log('product', product)
  const [store, updateStore] = useState(product)
  const { actions } = useContext(SessionContext)
  const [addToCartInProgress, setAddToCartInProgress] = useState(false)

  const handleSubmit = async event => {
    event.preventDefault() // prevent the page location from changing
    setAddToCartInProgress(true) // disable the add to cart button until the request is finished

    try {
      // send the data to the server
      await actions.addToCart({
        product: store,
        quantity: 1,
        size: store.size.id,
      })

      // open the confirmation dialog
      // setConfirmationOpen(true)
    } finally {
      // re-enable the add to cart button
      setAddToCartInProgress(false)
    }
  }

  return (
    <div>
      <div>
        {store.image ? (
          <Image src={store.image} width={250} height={250} alt={store.name} />
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
      <div className="font-black mt-4 text-xl">{store.name}</div>
      {store.sizeDesc && (
        <div className="font-bold mt-2 text-gray-700 text-xs">{store.sizeDesc}</div>
      )}
      <div className="mt-1 text-xs">{store.desc}</div>
      {sizeSelector && (
        <ProductOptionSelector
          options={store.sizes}
          value={store.size}
          onChange={value => updateStore({ ...store, size: value })}
          optionProps={{
            size: 'small',
            showLabel: true,
          }}
          OptionComponent={ProductOption}
        />
      )}
      <div className="mt-10 flex justify-between items-center">
        <button
          className="bg-yellow focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-white uppercase inline-flex items-center"
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
          В корзину
        </button>
        <span className="text-xl">
          {currency(store.size ? store.size.price : store.price, {
            pattern: '# !',
            separator: ' ',
            decimal: ',',
            symbol: 'сўм',
            precision: 0,
          }).format()}
        </span>
      </div>
      <style global jsx>{`
        [data-id='ProductOptionSelector'] {
          display: flex;
          border: 1px solid #e5e5e5;
          box-sizing: border-box;
          border-radius: 17.5px;
          justify-content: space-between;
          margin-top: 20px;
          flex-wrap: nowrap !important;
        }
      `}</style>
    </div>
  )
}

ProductItemNew.defaultProps = {
  sizeSelector: false,
}

export default memo(ProductItemNew)
