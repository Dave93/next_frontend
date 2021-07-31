import React, { memo, useState, useContext, FC, useMemo } from 'react'
import Image from 'next/image'
import ProductOptionSelector from './ProductOptionSelector'
import currency from 'currency.js'
import {
  Product,
  ProductOptionValues,
  ProductPrice,
} from '@commerce/types/product'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import styles from './ProductOptionSelector.module.css'
import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import { useCart } from '@framework/cart'
// import SessionContext from 'react-storefront/session/SessionContext'

type ProductItem = {
  product: Product
  channelName: string
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const ProductItemNew: FC<ProductItem> = ({ product, channelName }) => {
  const { t: tr } = useTranslation('common')
  const [store, updateStore] = useState(product)
  const [isLoadingBasket, setIsLoadingBasket] = useState(false)
  const { mutate } = useCart()

  const [addToCartInProgress, setAddToCartInProgress] = useState(false)
  const [isChoosingModifier, setIsChoosingModifier] = useState(false)
  const [activeModifier, setActiveModifier] = useState(null)
  const router = useRouter()
  const { locale } = router

  const updateOptionSelection = (valueId: string) => {
    const prod = store
    if (prod.variants) {
      prod.variants = prod.variants.map((v) => {
        if (v.id == valueId) {
          v.active = true
        } else {
          v.active = false
        }
        return v
      })
    }

    // console.log(prod)
    updateStore({ ...prod })
  }

  const addModifier = (modId: number) => {
    const prod = { ...store }
    if (prod.variants && prod.variants.length) {
      prod.variants = prod.variants.map((v) => {
        if (v.active) {
          v.modifiers = v.modifiers.map((mod: any) => {
            if (mod.id == modId) {
              mod.active = !mod.active
            }
            return mod
          })
          const activeMods = v.modifiers.filter((mod: any) => mod.active)
          if (!activeMods.length) {
            v.modifiers = v.modifiers.map((mod: any) => {
              if (mod.price == 0) {
                mod.active = true
              }
              return mod
            })
          }
        } else {
          v.modifiers = v.modifiers.map((mod: any) => {
            if (mod.price == 0) {
              mod.active = true
            } else {
              mod.active = false
            }
            return mod
          })
        }
        return v
      })
    } else {
      prod.modifiers = prod?.modifiers?.map((mod: any) => {
        if (mod.id == modId) {
          mod.active = !mod.active
        }
        return mod
      })
      const activeMods = prod?.modifiers?.filter((mod: any) => mod.active)
      if (!activeMods?.length) {
        prod.modifiers = prod?.modifiers?.map((mod: any) => {
          if (mod.price == 0) {
            mod.active = true
          }
          return mod
        })
      }
    }

    updateStore({ ...prod })
  }

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      Cookies.set('X-XSRF-TOKEN', csrf)
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const addToBasket = async () => {
    setIsLoadingBasket(true)
    await setCredentials()
    let selectedProdId = 0
    if (store.variants && store.variants.length) {
      let selectedVariant = store.variants.find((v: any) => v.active == true)
      selectedProdId = selectedVariant.id
    } else {
      selectedProdId = +store.id
    }

    let basketId = localStorage.getItem('basketId')

    if (basketId) {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines`,
        {
          basket_id: basketId,
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers:
                modifiers &&
                modifiers
                  .filter((m: any) => m.active)
                  .map((m: any) => ({ id: m.id })),
            },
          ],
        }
      )
    } else {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets`,
        {
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers:
                modifiers &&
                modifiers
                  .filter((m: any) => m.active)
                  .map((m: any) => ({ id: m.id })),
            },
          ],
        }
      )
      localStorage.setItem('basketId', basketData.data.id)
    }

    basketId = localStorage.getItem('basketId')

    let { data: basket } = await axios.get(
      `${webAddress}/api/v1/baskets/${basketId}`
    )
    const basketResult = {
      id: basket.data.id,
      createdAt: '',
      currency: { code: basket.data.currency },
      taxesIncluded: basket.data.tax_total,
      lineItems: basket.data.lines.data,
      lineItemsSubtotalPrice: basket.data.sub_total,
      subtotalPrice: basket.data.sub_total,
      totalPrice: basket.data.total,
    }

    await mutate(basketResult, false)
    setIsLoadingBasket(false)
    if (modifiers && modifiers.length) {
      setIsChoosingModifier(false)
    }
  }

  const discardModifier = async () => {}

  const modifiers = useMemo(() => {
    let modifier = null
    if (store.variants && store.variants.length) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )
      if (activeValue && activeValue.modifiers) {
        modifier = activeValue.modifiers
      }
    } else {
      if (store.modifiers && store.modifiers.length) {
        modifier = store.modifiers
      }
    }
    return modifier
  }, [store])

  const totalPrice = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    return price
  }, [store.price, store.variants])

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault() // prevent the page location from changing
    // setAddToCartInProgress(true) // disable the add to cart button until the request is finished
    if (modifiers && modifiers.length) {
      setIsChoosingModifier(true)
    }
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
      // setAddToCartInProgress(false)
    }
  }

  return (
    <>
      {isChoosingModifier ? (
        <div className="gap-4 grid grid-cols-2 items-center justify-between relative md:flex md:flex-col px-6 py-4 rounded-[15px] shadow-lg">
          {isLoadingBasket && (
            <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60">
              <svg
                className="animate-spin text-yellow h-14"
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
            </div>
          )}
          <div className="border-b border-yellow pb-3 text-center text-xl w-full">
            Добавить
          </div>
          <div className="flex-grow gap-3 grid grid-cols-2">
            {modifiers &&
              modifiers.map((mod: any) => (
                <div
                  key={mod.id}
                  className={`border ${
                    mod.active ? 'border-yellow' : 'border-gray-300'
                  } flex flex-col justify-between overflow-hidden rounded-[15px] cursor-pointer`}
                  onClick={() => addModifier(mod.id)}
                >
                  <div className="flex-grow pt-2 px-2">
                    {mod.image ? (
                      <Image
                        src={mod.image}
                        width={80}
                        height={80}
                        alt={mod.name}
                      />
                    ) : (
                      <Image
                        src="/no_photo.svg"
                        width={80}
                        height={80}
                        alt={mod.name}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div className="px-2 text-center text-xs pb-1">
                    {mod.name}
                  </div>
                  <div
                    className={`${
                      mod.active ? 'bg-yellow' : 'bg-gray-300'
                    } font-bold px-4 py-2 text-center text-white text-xs`}
                  >
                    {currency(mod.price, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: 'сўм',
                      precision: 0,
                    }).format()}
                  </div>
                </div>
              ))}
          </div>
          <div className="gap-3 grid grid-cols-2 w-full">
            <button
              className="bg-yellow focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-center text-white uppercase"
              onClick={addToBasket}
            >
              Да
            </button>
            <button
              className="bg-gray-200 focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-center text-white uppercase"
              onClick={discardModifier}
            >
              Нет
            </button>
          </div>
        </div>
      ) : (
        <div className="gap-4 grid grid-cols-2 py-4 md:py-0 items-center justify-between md:flex md:flex-col">
          <div>
            <div className="text-center">
              {store.image ? (
                <Image
                  src={store.image}
                  width={250}
                  height={250}
                  alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                />
              ) : (
                <Image
                  src="/no_photo.svg"
                  width={250}
                  height={250}
                  alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                  className="rounded-full"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col flex-grow w-full">
            <div className="font-black mt-4 text-xl">
              {store?.attribute_data?.name[channelName][locale || 'ru']}
            </div>
            {store.sizeDesc && (
              <div className="font-bold mt-2 text-gray-700 text-xs">
                {store.sizeDesc}
              </div>
            )}
            <div
              className="mt-1 text-xs flex-grow"
              dangerouslySetInnerHTML={{
                __html: store?.attribute_data?.description
                  ? store?.attribute_data?.description[channelName][
                      locale || 'ru'
                    ]
                  : '',
              }}
            ></div>
            <div className="hidden md:block">
              {store.variants && store.variants.length > 0 && (
                <div className={styles.productSelectorOption}>
                  {store.variants.map((v) => (
                    <div
                      className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
                        v.active ? 'bg-gray-300' : ''
                      }`}
                      onClick={() => updateOptionSelection(v.id)}
                      key={v.id}
                    >
                      <button className="outline-none focus:outline-none text-xs py-2">
                        {locale == 'ru' ? v?.custom_name : v?.custom_name_uz}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:mt-10 mt-2 flex justify-between items-center text-sm">
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
              <span className="md:text-xl bg-yellow md:bg-white w-28 md:w-auto rounded-full px-2 py-2 text-sm text-center md:px-0 md:py-0 text-white md:text-black">
                <span className="md:hidden">от</span>{' '}
                {currency(totalPrice, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: 'сўм',
                  precision: 0,
                }).format()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(ProductItemNew)
