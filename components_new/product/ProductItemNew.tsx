import React, {
  memo,
  useState,
  useContext,
  Fragment,
  FC,
  useMemo,
  useRef,
  useEffect,
} from 'react'
import Image from 'next/image'
import ProductOptionSelector from './ProductOptionSelector'
import currency from 'currency.js'
import { Dialog, Transition } from '@headlessui/react'
import {
  Product,
  ProductOptionValues,
  ProductPrice,
} from '@commerce/types/product'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import { useCart } from '@framework/cart'
import { XIcon } from '@heroicons/react/solid'
import styles from './ProductItemNew.module.css'
import { useUI } from '@components/ui/context'
import { DateTime } from 'luxon'
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
  const { stopProducts, locationData } = useUI()
  const { mutate } = useCart()

  const [addToCartInProgress, setAddToCartInProgress] = useState(false)
  const [isChoosingModifier, setIsChoosingModifier] = useState(false)
  const [activeModifiers, setActiveModifiers] = useState([] as number[])
  const [configData, setConfigData] = useState({} as any)
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  const router = useRouter()
  const { locale } = router

  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(`${webAddress}/api/configs/public`)
      configData = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      configData = sessionStorage.getItem('configData')
    }

    try {
      configData = Buffer.from(configData, 'base64')
      configData = configData.toString('ascii')
      configData = JSON.parse(configData)
      setConfigData(configData)
    } catch (e) { }
  }

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    if (isProductInStop) {
      return
    }
    setIsOpen(true)
  }

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
    setActiveModifiers([])
    // console.log(prod)
    updateStore({ ...prod })
  }

  const addModifier = (modId: number) => {
    let modifierProduct: any = null
    if (store.variants && store.variants.length) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )

      if (activeValue.modifierProduct) {
        modifierProduct = activeValue.modifierProduct
      }
    }
    let zeroModifier = modifiers.find((mod: any) => mod.price == 0)
    if (activeModifiers.includes(modId)) {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == modId)
      if (!currentModifier) return
      if (currentModifier.price == 0) return
      let resultModifiers = [
        ...activeModifiers.filter((id) => modId != id),
      ].filter((id) => id)
      setActiveModifiers(resultModifiers)
    } else {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == modId)
      let selectedModifiers = [...activeModifiers, modId]

      if (modifierProduct) {
        let sausage = modifiers.find((mod: any) => mod.id == modifierProduct.id)
        if (
          selectedModifiers.includes(modifierProduct.id) &&
          sausage.price < currentModifier.price
        ) {
          selectedModifiers = [
            ...selectedModifiers.filter((modId: any) => modId != sausage.id),
          ]
        } else if (currentModifier.id == sausage.id) {
          let richerModifier = modifiers
            .filter((mod: any) => mod.price > sausage.price)
            .map((mod: any) => mod.id)
          selectedModifiers = [
            ...selectedModifiers.filter(
              (modId: any) => !richerModifier.includes(modId)
            ),
            modId,
          ]
        }
      }
      setActiveModifiers(selectedModifiers)
    }
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
      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const addToBasket = async (mods: any = null) => {
    let modifierProduct: any = null
    let selectedModifiers: any = null
    setIsLoadingBasket(true)
    await setCredentials()

    if (!mods || !mods.length) {
      mods = activeModifiers
    }
    if (modifiers) {
      selectedModifiers = modifiers
        .filter((m: any) => mods.includes(m.id))
        .map((m: any) => ({ id: m.id }))
    }

    let selectedProdId = 0
    if (store.variants && store.variants.length) {
      let selectedVariant = store.variants.find((v: any) => v.active == true)
      selectedProdId = selectedVariant.id
      if (selectedVariant.modifierProduct) {
        modifierProduct = selectedVariant.modifierProduct
      }

      if (mods.length && modifierProduct) {
        if (mods.includes(modifierProduct.id)) {
          selectedProdId = modifierProduct.id
          let currentProductModifiersPrices = [
            ...modifiers
              .filter(
                (mod: any) =>
                  mod.id != modifierProduct.id && mods.includes(mod.id)
              )
              .map((mod: any) => mod.price),
          ]
          selectedModifiers = modifierProduct.modifiers
            .filter((mod: any) =>
              currentProductModifiersPrices.includes(mod.price)
            )
            .map((m: any) => ({ id: m.id }))
        }
      }
    } else {
      selectedProdId = +store.id
    }

    if (isProductInStop) {
      setIsLoadingBasket(false)
      return
    }

    let basketId = localStorage.getItem('basketId')
    const otpToken = Cookies.get('opt_token')

    let basketResult = {}

    if (basketId) {
      let additionalQuery = ''
      if (locationData && locationData.deliveryType == 'pickup') {
        additionalQuery = `?delivery_type=pickup`
      }
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines${additionalQuery}`,
        {
          basket_id: basketId,
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: selectedModifiers,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      basketResult = {
        id: basketData.data.id,
        createdAt: '',
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
      }
    } else {
      let additionalQuery = ''
      if (locationData && locationData.deliveryType == 'pickup') {
        additionalQuery = `?delivery_type=pickup`
      }
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets${additionalQuery}`,
        {
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: selectedModifiers,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      localStorage.setItem('basketId', basketData.data.encoded_id)
      basketResult = {
        id: basketData.data.id,
        createdAt: '',
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
        discountTotal: basketData.data.discount_total,
        discountValue: basketData.data.discount_value,
      }
    }

    await mutate(basketResult, false)
    setIsLoadingBasket(false)
    if (modifiers && modifiers.length) {
      setIsChoosingModifier(false)
    }

    if (window.innerWidth < 768) {
      closeModal()
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const modifiers = useMemo(() => {
    let modifier = null
    if (store.variants && store.variants.length) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )
      if (activeValue && activeValue.modifiers) {
        modifier = activeValue.modifiers
        if (activeValue.modifierProduct) {
          let isExistSausage = modifier.find(
            (mod: any) => mod.id == activeValue.modifierProduct.id
          )
          if (!isExistSausage) {
            modifier.push({
              id: activeValue.modifierProduct.id,
              name: 'Сосисочный борт',
              name_uz: "Sosiskali bo'rt",
              name_en: 'Sausage border',
              price: +activeValue.modifierProduct.price - +activeValue.price,
              assets: [
                {
                  local: '/sausage_modifier.png',
                },
              ],
            })
          }
        }
      }
    } else {
      if (store.modifiers && store.modifiers.length) {
        modifier = store.modifiers
      }
    }

    if (modifier) {
      modifier.sort(function (a: any, b: any) {
        if (+a.price > +b.price) {
          return 1
        }
        if (+a.price < +b.price) {
          return -1
        }
        // a должно быть равным b
        return 0
      })
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

    if (modifiers && modifiers.length) {
      modifiers.map((mod: any) => {
        if (activeModifiers.includes(mod.id)) {
          price += mod.price
        }
      })
    }

    if (
      locationData &&
      configData.discount_end_date &&
      locationData.deliveryType == 'pickup' &&
      locationData.terminal_id &&
      configData.discount_catalog_sections
        .split(',')
        .map((i: string) => +i)
        .includes(store.category_id)
    ) {
      if (DateTime.now().toFormat('E') != configData.discount_disable_day) {
        if (DateTime.now() <= DateTime.fromSQL(configData.discount_end_date)) {
          if (configData.discount_value) {
            price = price * ((100 - configData.discount_value) / 100)
          }
        }
      }
    }

    return price
  }, [
    store.price,
    store.variants,
    modifiers,
    activeModifiers,
    locationData,
    configData,
  ])

  const isProductInStop = useMemo(() => {
    if (store.variants && store.variants.length) {
      let selectedVariant = store.variants.find((v: any) => v.active == true)
      let selectedProdId = selectedVariant.id
      if (stopProducts.includes(selectedProdId)) {
        return true
      }
    } else {
      let selectedProdId = +store.id
      if (stopProducts.includes(selectedProdId)) {
        return true
      }
    }
    return false
  }, [stopProducts, store])

  const prodPriceDesktop = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }
    if (
      locationData &&
      configData.discount_end_date &&
      locationData.deliveryType == 'pickup' &&
      locationData.terminal_id &&
      configData.discount_catalog_sections
        .split(',')
        .map((i: string) => +i)
        .includes(store.category_id)
    ) {
      if (DateTime.now().toFormat('E') != configData.discount_disable_day) {
        if (DateTime.now() <= DateTime.fromSQL(configData.discount_end_date)) {
          if (configData.discount_value) {
            price = price * ((100 - configData.discount_value) / 100)
          }
        }
      }
    }

    return price
  }, [store.price, store.variants, locationData, configData])

  const prodDiscountPriceDesktop = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    if (
      locationData &&
      configData.discount_end_date &&
      locationData.deliveryType == 'pickup' &&
      locationData.terminal_id &&
      configData.discount_catalog_sections
        .split(',')
        .map((i: string) => +i)
        .includes(store.category_id)
    ) {
      if (DateTime.now().toFormat('E') != configData.discount_disable_day) {
        if (DateTime.now() <= DateTime.fromSQL(configData.discount_end_date)) {
          if (configData.discount_value) {
            return price * (configData.discount_value / 100)
          }
        }
      }
    }
    return 0
  }, [store.price, store.variants, locationData, configData])

  const prodPriceMobile = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants[0]
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    return price
  }, [store.price, store.variants])

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault() // prevent the page location from changing
    // setAddToCartInProgress(true) // disable the add to cart button until the request is finished
    if (modifiers && modifiers.length) {
      if (store.variants && store.variants.length) {
        let selectedVariant = store.variants.find((v: any) => v.active == true)
        let selectedProdId = selectedVariant.id
      } else {
        let selectedProdId = store.id
      }
      if (isProductInStop) {
        return // if the product is in stop, do not add to basket
      }
      setIsChoosingModifier(true)
    } else {
      addToBasket()
    }
  }
  // console.log(modifiers)
  return (
    <>
      {isChoosingModifier ? (
        <div
          className="items-center bg-white justify-between relative flex flex-col px-6 py-4 rounded-[15px] shadow-lg"
          id={`prod-${store.id}`}
        >
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
          <div className="absolute right-2">
            <XIcon
              className="cursor-pointer h-4 text-black w-4"
              onClick={() => setIsChoosingModifier(false)}
            />
          </div>
          <div className="border-b border-yellow pb-3 text-center text-xl w-full">
            {tr('add')}
          </div>
          <div className="max-h-96 overflow-y-auto py-5 space-y-2 w-full">
            {modifiers &&
              modifiers.map((mod: any) => (
                <div
                  key={mod.id}
                  className={`border ${activeModifiers.includes(mod.id)
                      ? 'border-yellow border-2 shadow-md'
                      : 'border-gray-300'
                    } flex items-center justify-between overflow-hidden rounded-[15px] cursor-pointer`}
                  onClick={() => addModifier(mod.id)}
                >
                  <div className="px-2">
                    {mod.assets.length ? (
                      <img
                        src={
                          mod.assets[0].local
                            ? mod.assets[0].local
                            : `${webAddress}/storage/${mod.assets[0]?.location}/${mod.assets[0]?.filename}`
                        }
                        width={50}
                        height={50}
                        alt={mod.name}
                        className="mx-auto"
                      />
                    ) : (
                      <img
                        src="/no_photo.svg"
                        width={50}
                        height={50}
                        alt={mod.name}
                        className="rounded-full mx-auto"
                      />
                    )}
                  </div>
                  <div className="text-center text-base m-auto">
                    <div>
                      {locale == 'uz' ? mod.name_uz : ''}
                      {locale == 'ru' ? mod.name_ru : ''}
                      {locale == 'en' ? mod.name_en : ''}
                    </div>

                    <div className={`font-bold text-center text-sm`}>
                      {currency(mod.price, {
                        pattern: '# !',
                        separator: ' ',
                        decimal: '.',
                        symbol: `${locale == 'uz' ? "so'm" : ''} ${locale == 'ru' ? 'сум' : ''
                          } ${locale == 'en' ? 'sum' : ''}`,
                        precision: 0,
                      }).format()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="mx-auto">
            <button
              className="bg-yellow focus:outline-none font-bold outline-none px-10 py-2 rounded-full text-center text-white uppercase"
              onClick={addToBasket}
            >
              {tr('add')}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.gridItemOutline} ${isProductInStop ? 'opacity-25' : ''
            } gap-4 grid grid-cols-2 py-4 px-2 md:py-3 md:px-3 overflow-hidden bg-white rounded-[15px] hover:shadow-xl shadow-sm group items-center justify-between md:flex md:flex-col`}
          id={`prod-${store.id}`}
          itemScope
          itemType="https://schema.org/Product"
        >
          <div className="text-center">
            {store.image ? (
              <img
                src={store.image}
                width={250}
                height={250}
                alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                className="transform motion-safe:group-hover:scale-105 transition duration-500 object-cover"
                itemProp="image"
              />
            ) : (
              <img
                src="/no_photo.svg"
                width={250}
                height={250}
                alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                className="rounded-full transform motion-safe:group-hover:scale-105 transition duration-500"
              />
            )}
          </div>
          <div className="flex flex-col flex-grow w-full">
            <div className="font-serif mt-4 text-xl uppercase" itemProp="name">
              {store?.attribute_data?.name[channelName][locale || 'ru']}
            </div>
            {store.sizeDesc && (
              <div className="mt-2 text-gray-700 text-xs">{store.sizeDesc}</div>
            )}
            <div
              className="mt-1 flex-grow"
              dangerouslySetInnerHTML={{
                __html: store?.attribute_data?.description
                  ? store?.attribute_data?.description[channelName][
                  locale || 'ru'
                  ]
                  : '',
              }}
              itemProp="description"
            ></div>
            <div className="hidden md:block">
              {store.variants && store.variants.length > 0 && (
                <div className="flex mt-5 space-x-1 -mx-2">
                  {store.variants.map((v) => (
                    <div className="w-full" key={v.id}>
                      <div
                        className={`w-full text-center cursor-pointer rounded-2xl outline-none ${v.active
                            ? 'bg-yellow text-white'
                            : 'bg-gray-200 text-gray-400'
                          }`}
                        onClick={() => updateOptionSelection(v.id)}
                      >
                        <button className="outline-none focus:outline-none text-xs py-2">
                          {locale == 'ru'
                            ? v?.custom_name
                            : locale == 'uz'
                              ? v?.custom_name_uz
                              : locale == 'en'
                                ? v?.custom_name_en
                                : ''}
                        </button>
                      </div>

                      {/* <div
                        className={` flex flex-col items-center w-full ${
                          v.active ? 'text-yellow' : ''
                        }`}
                      >
                        {(locale == 'ru' ? 'гр ' : 'gr ') + v.weight}
                      </div> */}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:mt-10 mt-2 flex justify-between items-center text-sm">
              <button
                className="bg-yellow focus:outline-none md:w-32 md:justify-around font-bold outline-none py-2 rounded-full text-white uppercase md:inline-flex items-center hidden"
                onClick={handleSubmit}
                disabled={isLoadingBasket}
              >
                {isLoadingBasket ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white flex-grow text-center"
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
                ) : (
                  tr('main_to_basket')
                )}
              </button>
              <div
                className="hidden md:block"
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                {prodDiscountPriceDesktop > 0 && (
                  <span
                    className="md:text-sm md:bg-white hidden md:block md:w-auto rounded-full text-xs text-left line-through md:px-0 md:py-0 md:text-gray-500"
                    itemProp="price"
                  >
                    {currency(prodPriceDesktop + prodDiscountPriceDesktop, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: `${locale == 'uz' ? "so'm" : ''} ${locale == 'ru' ? 'сум' : ''
                        } ${locale == 'en' ? 'sum' : ''}`,
                      precision: 0,
                    }).format()}
                  </span>
                )}
                <span className="md:text-xl md:bg-white hidden md:block md:w-auto rounded-full text-sm text-center md:px-0 md:py-0 md:text-black">
                  {currency(prodPriceDesktop, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : ''} ${locale == 'ru' ? 'сум' : ''
                      } ${locale == 'en' ? 'sum' : ''}`,
                    precision: 0,
                  }).format()}
                </span>
              </div>
              <button
                className="md:text-xl md:hidden bg-yellow flex flex-col items-center md:bg-white w-28 md:w-auto rounded-full px-2 py-2 text-sm text-center md:px-0 md:py-0 text-white md:text-black"
                onClick={openModal}
              >
                <span>
                  {prodDiscountPriceDesktop > 0 && (
                    <span className="md:text-sm md:bg-white md:w-auto rounded-full text-xs text-left line-through md:px-0 md:py-0 md:text-gray-500">
                      {currency(prodPriceDesktop + prodDiscountPriceDesktop, {
                        pattern: '# !',
                        separator: ' ',
                        decimal: '.',
                        symbol: `${locale == 'uz' ? "so'm" : ''} ${locale == 'ru' ? 'сум' : ''
                          } ${locale == 'en' ? 'sum' : ''}`,
                        precision: 0,
                      }).format()}
                    </span>
                  )}
                </span>
                <span>
                  {locale == 'uz' ? '' : <span>от </span>}
                  {currency(prodPriceDesktop, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : ''} ${locale == 'ru' ? 'сум' : ''
                      } ${locale == 'en' ? 'sum' : ''}`,
                    precision: 0,
                  }).format()}
                </span>
              </button>
              <Transition.Root show={isOpen} as={Fragment}>
                <Dialog
                  initialFocus={completeButtonRef}
                  as="div"
                  className="fixed inset-0 z-50 overflow-y-auto"
                  open={isOpen}
                  onClose={closeModal}
                >
                  <div className="flex items-end justify-center min-h-screen  text-center sm:block sm:p-0">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span
                      className="hidden sm:inline-block sm:align-middle sm:h-screen"
                      aria-hidden="true"
                    >
                      &#8203;
                    </span>
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      enterTo="opacity-100 translate-y-0 sm:scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                      <div className="bg-white p-4 text-left transform w-full">
                        <div className="flex fixed w-full max-h-10 -ml-4 -mt-4 bg-white pt-8 pl-4 top-0 flex-col">
                          <div className="flex w-full items-center">
                            <span onClick={closeModal} className="flex">
                              <img
                                src="/assets/back.png"
                                width="24"
                                height="24"
                              />
                            </span>
                          </div>
                        </div>
                        <div className=" overflow-y-auto mt-6 overflow-hidden">
                          <div className=" mx-auto bg-cover flex relative mt-10">
                            {store.image ? (
                              <img
                                src={store.image}
                                alt={
                                  store?.attribute_data?.name[channelName][
                                  locale || 'ru'
                                  ]
                                }
                                className="mx-auto"
                              />
                            ) : (
                              <img
                                src="/no_photo.svg"
                                alt={
                                  store?.attribute_data?.name[channelName][
                                  locale || 'ru'
                                  ]
                                }
                                className="rounded-full mx-auto"
                              />
                            )}
                          </div>
                          <div className="font-black mt-4 text-xl">
                            {
                              store?.attribute_data?.name[channelName][
                              locale || 'ru'
                              ]
                            }
                          </div>
                          <div
                            className="mt-1 text-base flex-grow"
                            dangerouslySetInnerHTML={{
                              __html: store?.attribute_data?.description
                                ? store?.attribute_data?.description[
                                channelName
                                ][locale || 'ru']
                                : '',
                            }}
                          ></div>
                          {store.variants && store.variants.length > 0 && (
                            <div className="flex mt-5 space-x-1">
                              {store.variants.map((v) => (
                                <div className="w-full" key={v.id}>
                                  <div
                                    className={`w-full text-center cursor-pointer rounded-2xl outline-none ${v.active
                                        ? 'bg-yellow text-white shadow-xl'
                                        : 'bg-gray-200 text-gray-600'
                                      }`}
                                    onClick={() => updateOptionSelection(v.id)}
                                  >
                                    <button className="outline-none focus:outline-none text-xs py-2">
                                      {locale == 'ru'
                                        ? v?.custom_name
                                        : v?.custom_name_uz}
                                    </button>
                                  </div>
                                  {/* <div
                                    className={` flex flex-col items-center w-full ${
                                      v.active ? 'text-yellow' : ''
                                    }`}
                                  >
                                    {(locale == 'ru' ? 'гр ' : 'gr ') +
                                      v.weight}
                                  </div> */}
                                </div>
                              ))}
                            </div>
                          )}
                          {modifiers && (
                            <div className="pb-10">
                              <div className="my-2">
                                <span>{tr('add_to_pizza')}</span>
                              </div>
                              <div className="overflow-x-scroll">
                                <div className="-mr-20 flex space-x-2 pb-2">
                                  {modifiers.map((mod: any, index: number) => (
                                    <div
                                      key={mod.id}
                                      className={`border ${activeModifiers.length &&
                                          activeModifiers.includes(mod.id)
                                          ? 'border-yellow'
                                          : 'border-gray-300'
                                        } flex flex-col justify-between overflow-hidden rounded-[15px] cursor-pointer w-24`}
                                      onClick={() => addModifier(mod.id)}
                                    >
                                      <div className="flex-grow pt-2 px-2">
                                        {mod.assets.length ? (
                                          <img
                                            src={
                                              mod.assets[0].local
                                                ? mod.assets[0].local
                                                : `${webAddress}/storage/${mod.assets[0]?.location}/${mod.assets[0]?.filename}`
                                            }
                                            width={50}
                                            height={50}
                                            alt={mod.name}
                                            className="mx-auto"
                                          />
                                        ) : (
                                          <img
                                            src="/no_photo.svg"
                                            width={50}
                                            height={50}
                                            alt={mod.name}
                                            className="rounded-full mx-auto"
                                          />
                                        )}
                                      </div>
                                      <div className="text-center text-xs">
                                        {locale == 'uz'
                                          ? mod.name_uz
                                          : mod.name}
                                      </div>
                                      <div
                                        className={`${activeModifiers.length &&
                                            activeModifiers.includes(mod.id)
                                            ? 'bg-yellow'
                                            : 'bg-gray-300'
                                          } font-bold px-2 py-2 text-center text-white text-xs`}
                                      >
                                        {currency(mod.price, {
                                          pattern: '# !',
                                          separator: ' ',
                                          decimal: '.',
                                          symbol: `${locale == 'uz' ? "so'm" : ''
                                            } ${locale == 'ru' ? 'сум' : ''} ${locale == 'en' ? 'sum' : ''
                                            }`,
                                          precision: 0,
                                        }).format()}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="bg-white flex items-center px-3 py-5 w-full sticky bottom-0">
                          <button
                            className="bg-yellow flex items-center justify-around focus:outline-none font-bold outline-none py-2 rounded-full text-center text-white w-full"
                            onClick={addToBasket}
                          >
                            {isLoadingBasket ? (
                              <svg
                                className="animate-spin h-5 w-5 text-white flex-grow text-center"
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
                            ) : (
                              <span>
                                {tr('main_to_basket')}{' '}
                                {currency(totalPrice, {
                                  pattern: '# !',
                                  separator: ' ',
                                  decimal: '.',
                                  symbol: `${locale == 'uz' ? "so'm" : ''} ${locale == 'ru' ? 'сум' : ''
                                    } ${locale == 'en' ? 'sum' : ''}`,
                                  precision: 0,
                                }).format()}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </Transition.Child>
                  </div>
                </Dialog>
              </Transition.Root>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(ProductItemNew)
