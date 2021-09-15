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
import styles from './ProductOptionSelector.module.css'
import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import { useCart } from '@framework/cart'
import { XIcon, CheckIcon } from '@heroicons/react/outline'
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
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  const router = useRouter()
  const { locale } = router

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
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

    if (window.innerWidth < 768) {
      closeModal()
    }
  }

  const discardModifier = async () => {
    let prod = { ...store }
    if (prod.variants && prod.variants.length) {
      console.log(prod.variants)
      prod.variants = prod.variants.map((vars: any) => {
        if (vars.active == true) {
          vars.modifiers = vars.modifiers.map((mod: any) => {
            if (mod.price == 0) {
              mod.active = true
            } else {
              mod.active = false
            }

            return mod
          })
        }

        return vars
      })
    }

    updateStore({ ...prod })
    addToBasket()
  }

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
    } else {
      addToBasket()
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
            {tr('add')}
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
                    {mod.assets.length ? (
                      <Image
                        src={`${webAddress}/storage/${mod.assets[0]?.location}/${mod.assets[0]?.filename}`}
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
              {tr('yes')}
            </button>
            <button
              className="bg-gray-200 focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-center text-white uppercase"
              onClick={discardModifier}
            >
              {tr('no')}
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
                className="bg-yellow focus:outline-none md:w-32 md:justify-around font-bold outline-none px-6 py-2 rounded-full text-white uppercase md:inline-flex items-center hidden"
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
                {currency(totalPrice, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: 'сўм',
                  precision: 0,
                }).format()}
              </span>
              <button
                className="md:text-xl md:hidden bg-yellow md:bg-white w-28 md:w-auto rounded-full px-2 py-2 text-sm text-center md:px-0 md:py-0 text-white md:text-black"
                onClick={openModal}
              >
                <span>от</span>{' '}
                {currency(totalPrice, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: 'сўм',
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
                      <div className="bg-white p-4 text-left transform h-screen overflow-y-auto w-full overflow-hidden fixed top-0">
                        <div className="flex fixed w-full max-h-10 flex-col">
                          <div className="flex w-full items-center">
                            <span onClick={closeModal} className="flex">
                              <Image
                                src="/assets/back.png"
                                width="24"
                                height="24"
                              />
                            </span>
                          </div>
                        </div>
                        <div className="h-80 w-80 mx-auto bg-cover flex relative mt-10">
                          {store.image ? (
                            <Image
                              src={store.image}
                              width={300}
                              height={300}
                              alt={
                                store?.attribute_data?.name[channelName][
                                  locale || 'ru'
                                ]
                              }
                            />
                          ) : (
                            <Image
                              src="/no_photo.svg"
                              width={300}
                              height={300}
                              alt={
                                store?.attribute_data?.name[channelName][
                                  locale || 'ru'
                                ]
                              }
                              className="rounded-full"
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
                              ? store?.attribute_data?.description[channelName][
                                  locale || 'ru'
                                ]
                              : '',
                          }}
                        ></div>
                        {store.variants && store.variants.length > 0 && (
                          <div className={styles.productSelectorOption}>
                            {store.variants.map((v) => (
                              <div
                                className={`w-full text-center cursor-pointer rounded-2xl outline-none border ${
                                  v.active ? 'bg-yellow text-white' : 'bg-gray-300 text-gray-600'
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
                          <div>
                            <div className="my-2">
                              <span>Добавить в пиццу</span>
                            </div>
                            <div className="flex-grow gap-3 grid grid-cols-4">
                              {modifiers.map((mod: any) => (
                                <div
                                  key={mod.id}
                                  className={`border ${
                                    mod.active
                                      ? 'border-yellow'
                                      : 'border-gray-300'
                                  } flex flex-col justify-between overflow-hidden rounded-[15px] cursor-pointer`}
                                  onClick={() => addModifier(mod.id)}
                                >
                                  <div className="flex-grow pt-2 px-2">
                                    {mod.assets.length ? (
                                      <Image
                                        src={`${webAddress}/storage/${mod.assets[0]?.location}/${mod.assets[0]?.filename}`}
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
                          </div>
                        )}
                        <div className="w-full fixed -ml-4 px-3 py-5 items-center flex mt-3">
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
                                  symbol: 'сўм',
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
