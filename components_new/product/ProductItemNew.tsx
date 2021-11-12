import React, {
  memo,
  useState,
  useContext,
  Fragment,
  FC,
  useMemo,
  useRef,
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
  const [activeModifiers, setActiveModifiers] = useState([] as number[])
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  const router = useRouter()
  const { locale } = router

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    if (modifiers && modifiers.length) {
      let freeModifier = modifiers.find((mod: any) => mod.price == 0)
      setActiveModifiers([freeModifier.id])
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
      if (!resultModifiers.length) {
        resultModifiers.push(zeroModifier.id)
      }
      setActiveModifiers(resultModifiers)
    } else {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == modId)
      if (currentModifier.price == 0) {
        setActiveModifiers([modId])
      } else {
        let selectedModifiers = [
          ...activeModifiers.filter((id: number) => id != zeroModifier.id),
          modId,
        ]

        if (modifierProduct) {
          let sausage = modifiers.find(
            (mod: any) => mod.id == modifierProduct.id
          )
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

          if (selectedModifiers.length == 0) {
            selectedModifiers = [
              {
                id: modifierProduct.modifiers.find((m: any) => m.price == 0).id,
              },
            ]
          }
        }
      }
    } else {
      selectedProdId = +store.id
    }

    let basketId = localStorage.getItem('basketId')
    const otpToken = Cookies.get('opt_token')

    let basketResult = {}

    if (basketId) {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines`,
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
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets`,
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

  const discardModifier = async () => {
    let freeModifier = modifiers.find((mod: any) => mod.price == 0)
    setActiveModifiers([freeModifier.id])
    addToBasket([freeModifier.id])
  }

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
              name_uz: 'Sosiskali tomoni',
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

    return price
  }, [store.price, store.variants, modifiers, activeModifiers])

  const prodPriceDesktop = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    return price
  }, [store.price, store.variants])

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
      let freeModifier = modifiers.find((mod: any) => mod.price == 0)
      setActiveModifiers([freeModifier.id])
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
          className="gap-4 grid grid-cols-2 items-center bg-white justify-between relative md:flex md:flex-col px-6 py-4 rounded-[15px] shadow-lg"
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
          <div className="max-h-96 overflow-y-auto">
            <div className="flex-grow gap-3 grid grid-cols-2">
              {modifiers &&
                modifiers.map((mod: any) => (
                  <div
                    key={mod.id}
                    className={`border ${
                      activeModifiers.includes(mod.id)
                        ? 'border-yellow'
                        : 'border-gray-300'
                    } flex flex-col justify-between overflow-hidden rounded-[15px] cursor-pointer`}
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
                      {locale == 'uz' ? mod.name_uz : mod.name}
                    </div>
                    <div
                      className={`${
                        activeModifiers.includes(mod.id)
                          ? 'bg-yellow'
                          : 'bg-gray-300'
                      } font-bold py-2 text-center text-white text-xs`}
                    >
                      {currency(mod.price, {
                        pattern: '# !',
                        separator: ' ',
                        decimal: '.',
                        symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                        precision: 0,
                      }).format()}
                    </div>
                  </div>
                ))}
            </div>
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
          className={`${styles.gridItemOutline} gap-4 grid grid-cols-2 py-4 px-2 md:py-3 md:px-3 overflow-hidden bg-white rounded-[15px] hover:shadow-xl shadow-sm group items-center justify-between md:flex md:flex-col`}
          id={`prod-${store.id}`}
        >
          <div>
            <div className="text-center">
              {store.image ? (
                <img
                  src={store.image}
                  width={250}
                  height={250}
                  alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                  className="transform motion-safe:group-hover:scale-105 transition duration-500"
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
                <div className="flex mt-5 space-x-1 -mx-2">
                  {store.variants.map((v) => (
                    <div
                      className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
                        v.active
                          ? 'bg-yellow text-white'
                          : 'bg-gray-200 text-gray-400'
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
              <span className="md:text-xl md:bg-white hidden md:block md:w-auto rounded-full text-sm text-center md:px-0 md:py-0 md:text-black">
                {currency(prodPriceDesktop, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                  precision: 0,
                }).format()}
              </span>
              <button
                className="md:text-xl md:hidden bg-yellow md:bg-white w-28 md:w-auto rounded-full px-2 py-2 text-sm text-center md:px-0 md:py-0 text-white md:text-black"
                onClick={openModal}
              >
                {locale == 'uz' ? '' : <span>от </span>}
                {currency(prodPriceMobile, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                  precision: 0,
                }).format()}
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
                      <div className="bg-white p-4 text-left transform h-screen w-full overflow-hidden fixed top-0">
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
                        <div className="h-[calc(85vh-24px)] overflow-y-auto mt-6 overflow-hidden">
                          <div className="h-[35vh] mx-auto bg-cover flex relative mt-10">
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
                            className="mt-1 text-xs flex-grow"
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
                                <div
                                  className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
                                    v.active
                                      ? 'bg-yellow text-white shadow-xl'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}
                                  onClick={() => updateOptionSelection(v.id)}
                                  key={v.id}
                                >
                                  <button className="outline-none focus:outline-none text-xs py-2">
                                    {locale == 'ru'
                                      ? v?.custom_name
                                      : v?.custom_name_uz}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {modifiers && (
                            <div className="pb-10">
                              <div className="my-2">
                                <span>Добавить в пиццу</span>
                              </div>
                              <div className="overflow-x-scroll">
                                <div className="-mr-20 flex space-x-2">
                                  {modifiers.map((mod: any, index: number) => (
                                    <div
                                      key={mod.id}
                                      className={`border ${
                                        (activeModifiers.length &&
                                          activeModifiers.includes(mod.id)) ||
                                        (!activeModifiers.length && index == 0)
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
                                        className={`${
                                          (activeModifiers.length &&
                                            activeModifiers.includes(mod.id)) ||
                                          (!activeModifiers.length &&
                                            index == 0)
                                            ? 'bg-yellow'
                                            : 'bg-gray-300'
                                        } font-bold px-2 py-2 text-center text-white text-xs`}
                                      >
                                        {currency(mod.price, {
                                          pattern: '# !',
                                          separator: ' ',
                                          decimal: '.',
                                          symbol: `${
                                            locale == 'uz' ? "so'm" : 'сум'
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
                        <div className="w-full fixed bottom-0 bg-white -ml-4 px-3 py-5 items-center flex mt-3">
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
                                  symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
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
