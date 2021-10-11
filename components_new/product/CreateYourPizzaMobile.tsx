import React, {
  memo,
  FC,
  useState,
  Fragment,
  useRef,
  useMemo,
  useEffect,
} from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon, CheckIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { divide, mixin } from 'lodash'
import currency from 'currency.js'
import getConfig from 'next/config'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useCart } from '@framework/cart'
import useTranslation from 'next-translate/useTranslation'

type CreatePizzaProps = {
  sec: any
  channelName: string
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const CreateYourPizza: FC<CreatePizzaProps> = ({ sec, channelName }) => {
  const router = useRouter()
  const { t: tr } = useTranslation('common')
  const { locale } = router
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  const { mutate } = useCart()
  let [active, setActive] = useState(true)
  const [isLoadingBasket, setIsLoadingBasket] = useState(false)
  const [activeModifiers, setActiveModifeirs] = useState([] as number[])
  const [activeCustomName, setActiveCustomName] = useState('')
  const [leftSelectedProduct, setLeftSelectedProduct] = useState(null as any)
  const [rightSelectedProduct, setRightSelectedProduct] = useState(null as any)
  const [isSecondPage, setIsSecondPage] = useState(false)
  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const changeCustomName = (name: string) => {
    // setLeftSelectedProduct(null)
    // setRightSelectedProduct(null)
    setActiveCustomName(name)
  }

  const changeToSecondPage = () => {
    if (!leftSelectedProduct || !rightSelectedProduct) {
      return
    }

    setIsSecondPage(true)
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

  const addToBasket = async () => {
    setIsLoadingBasket(true)
    await setCredentials()
    let modifierProduct: any = null
    let selectedModifiers: any[] = [...activeModifiers]
    let allModifiers = [...modifiers]
    let freeModifiers = allModifiers.find((mod: any) => mod.price == 0)
    if (selectedModifiers.length == 0) {
      selectedModifiers.push(freeModifiers.id)
    }

    selectedModifiers = allModifiers
      .filter((m: any) => selectedModifiers.includes(m.id))
      .map((m: any) => ({ id: m.id }))

    let leftProduct = leftSelectedProduct.variants.find((v: any) => {
      if (locale == 'uz') {
        return v?.custom_name_uz == activeCustomName
      } else {
        return v?.custom_name == activeCustomName
      }
    })

    let rightProduct = rightSelectedProduct.variants.find((v: any) => {
      if (locale == 'uz') {
        return v?.custom_name_uz == activeCustomName
      } else {
        return v?.custom_name == activeCustomName
      }
    })

    if (leftProduct.modifierProduct) {
      modifierProduct = leftProduct.modifierProduct
    }

    if (rightProduct.modifierProduct) {
      rightProduct = rightProduct.modifierProduct
    }

    if (selectedModifiers.length && modifierProduct) {
      if ([...activeModifiers].includes(modifierProduct.id)) {
        leftProduct = modifierProduct
        let currentProductModifiersPrices = [
          ...modifiers
            .filter(
              (mod: any) =>
                mod.id != modifierProduct.id &&
                [...activeModifiers].includes(mod.id)
            )
            .map((mod: any) => mod.price),
        ]
        if (currentProductModifiersPrices.length) {
          selectedModifiers = modifierProduct.modifiers
            .filter((mod: any) =>
              currentProductModifiersPrices.includes(mod.price)
            )
            .map((m: any) => ({ id: m.id }))
        } else {
          selectedModifiers = [{ id: freeModifiers.id }]
        }
      }
    }

    let basketId = localStorage.getItem('basketId')

    if (basketId) {
      await axios.post(`${webAddress}/api/baskets-lines`, {
        basket_id: basketId,
        variants: [
          {
            id: leftProduct.id,
            quantity: 1,
            modifiers: selectedModifiers,
            child: {
              id: rightProduct.id,
              quantity: 1,
              modifiers: [
                {
                  id: freeModifiers.id,
                },
              ],
            },
          },
        ],
      })
    } else {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets`,
        {
          variants: [
            {
              id: leftProduct.id,
              quantity: 1,
              modifiers: selectedModifiers,
              child: {
                id: rightProduct.id,
                quantity: 1,
                modifiers: [
                  {
                    id: freeModifiers.id,
                  },
                ],
              },
            },
          ],
        }
      )
      localStorage.setItem('basketId', basketData.data.id)
    }

    basketId = localStorage.getItem('basketId')

    let { data: basket } = await axios.get(
      `${webAddress}/api/baskets/${basketId}`
    )
    const basketResult = {
      id: basket.data.id,
      createdAt: '',
      currency: { code: basket.data.currency },
      taxesIncluded: basket.data.tax_total,
      lineItems: basket.data.lines,
      lineItemsSubtotalPrice: basket.data.sub_total,
      subtotalPrice: basket.data.sub_total,
      totalPrice: basket.data.total,
    }

    await mutate(basketResult, false)
    setIsLoadingBasket(false)
    setLeftSelectedProduct(null)
    setRightSelectedProduct(null)
    closeModal()
  }

  const customNames: string[] = useMemo(() => {
    const names: any = {}
    sec.items.map((item: any) => {
      item.variants.map((vars: any) => {
        if (locale == 'uz') {
          names[vars?.custom_name_uz] = vars?.custom_name_uz
        } else {
          names[vars?.custom_name] = vars?.custom_name
        }
      })
    })
    return Object.values(names)
  }, [sec, locale])

  const readyProductList = useMemo(() => {
    return sec.items.map((item: any) => {
      let res = item
      item.variants.map((vars: any) => {
        if (locale == 'uz') {
          if (vars?.custom_name_uz == activeCustomName) {
            res.price = vars.price
          }
        } else {
          if (vars?.custom_name == activeCustomName) {
            res.price = vars.price
          }
        }
      })
      return res
    })
  }, [sec, activeCustomName])

  const modifiers = useMemo(() => {
    if (!leftSelectedProduct || !rightSelectedProduct || !activeCustomName) {
      return []
    }
    let leftModifiers: any[] = []

    leftSelectedProduct.variants.map((vars: any) => {
      if (locale == 'uz') {
        if (vars?.custom_name_uz == activeCustomName) {
          leftModifiers = vars.modifiers
        }
      } else {
        if (vars?.custom_name == activeCustomName) {
          leftModifiers = vars.modifiers
        }
      }
    })

    let activeVariant: any = null
    leftSelectedProduct.variants.map((vars: any) => {
      if (locale == 'uz') {
        if (vars?.custom_name_uz == activeCustomName) {
          activeVariant = vars
        }
      } else {
        if (vars?.custom_name == activeCustomName) {
          activeVariant = vars
        }
      }
    })
    let rightActiveVariant: any = null
    rightSelectedProduct.variants.map((vars: any) => {
      if (locale == 'uz') {
        if (vars?.custom_name_uz == activeCustomName) {
          rightActiveVariant = vars
        }
      } else {
        if (vars?.custom_name == activeCustomName) {
          rightActiveVariant = vars
        }
      }
    })

    if (activeVariant && activeVariant.modifierProduct) {
      let isExistSausage = leftModifiers.find(
        (mod: any) => mod.id == activeVariant.modifierProduct.id
      )
      if (!isExistSausage) {
        leftModifiers.push({
          id: activeVariant.modifierProduct.id,
          name: 'Сосисочный борт',
          name_uz: 'Sosiskali tomoni',
          price:
            +activeVariant.modifierProduct.price -
            +activeVariant.price +
            (+rightActiveVariant.modifierProduct.price -
              +rightActiveVariant.price),
          assets: [
            {
              local: '/sausage_modifier.png',
            },
          ],
        })
      }
    }

    if (leftModifiers) {
      leftModifiers.sort(function (a: any, b: any) {
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
    return leftModifiers
  }, [leftSelectedProduct, rightSelectedProduct, activeCustomName])

  const totalSummary = useMemo(() => {
    let res = 0
    if (leftSelectedProduct) {
      res += +leftSelectedProduct.price
    }

    if (rightSelectedProduct) {
      res += +rightSelectedProduct.price
    }

    if (modifiers.length > 0) {
      const selectedModifiers: any[] = [
        ...modifiers.filter((mod: any) => activeModifiers.includes(mod.id)),
      ]
      selectedModifiers.map((mod: any) => {
        res += +mod.price
      })
    }

    return res
  }, [
    leftSelectedProduct,
    rightSelectedProduct,
    activeCustomName,
    activeModifiers,
  ])

  const addModifier = (id: number) => {
    let modifierProduct: any = null
    let activeVariant: any = null

    leftSelectedProduct.variants.map((vars: any) => {
      if (locale == 'uz') {
        if (vars?.custom_name_uz == activeCustomName) {
          activeVariant = vars
        }
      } else {
        if (vars?.custom_name == activeCustomName) {
          activeVariant = vars
        }
      }
    })
    if (activeVariant.modifierProduct) {
      modifierProduct = activeVariant.modifierProduct
    }
    let zeroModifier = modifiers.find((mod: any) => mod.price == 0)
    if (activeModifiers.includes(id)) {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == id)
      if (!currentModifier) return
      if (currentModifier.price == 0) return
      let resultModifiers = [
        ...activeModifiers.filter((modId) => modId != id),
      ].filter((id) => id)
      if (!resultModifiers.length) {
        resultModifiers.push(zeroModifier.id)
      }
      setActiveModifeirs(resultModifiers)
    } else {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == id)
      if (currentModifier.price == 0) {
        setActiveModifeirs([id])
      } else {
        let selectedModifiers = [
          ...activeModifiers.filter(
            (modId: number) => modId != zeroModifier.id
          ),
          id,
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
              id,
            ]
          }
        }
        setActiveModifeirs(selectedModifiers)
      }
    }
  }
  useEffect(() => {
    setActiveCustomName(customNames[0])
  }, [customNames])

  return (
    <>
      <div className="gap-4 grid grid-cols-2 py-4 md:py-0 items-center justify-between md:flex md:flex-col">
        <div className="text-center">
          <div>
            <Image src="/createYourPizza.png" width="250" height="250" />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold mb-2">
            {tr('create_your_own_pizza')}
          </div>
          <div className="mt-10">
            <button
              className="bg-gray-100 focus:outline-none font-bold outline-none px-6 py-2 text-sm rounded-full text-center text-yellow uppercase"
              onClick={openModal}
            >
              {tr('create_pizza')}
            </button>
          </div>
        </div>
      </div>
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
                {isSecondPage ? (
                  <>
                    <div className="flex fixed w-full max-h-10 flex-col">
                      <div className="flex w-full items-center">
                        <span
                          onClick={() => setIsSecondPage(false)}
                          className="flex"
                        >
                          <Image
                            src="/assets/back.png"
                            width="24"
                            height="24"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="mt-10 h-[calc(100%-100px)] overflow-hidden overflow-y-auto">
                      <div
                        className="h-80 w-80 mx-auto bg-cover flex relative"
                        style={{ backgroundImage: 'url(/createYourPizza.png)' }}
                      >
                        <div className="w-40 relative overflow-hidden">
                          {leftSelectedProduct && (
                            <div>
                              <Image
                                src={leftSelectedProduct.image}
                                width="320"
                                height="320"
                                layout="fixed"
                                className="absolute"
                              />
                            </div>
                          )}
                        </div>
                        <div className="w-40 relative overflow-hidden">
                          {rightSelectedProduct && (
                            <div className="absolute right-0">
                              <Image
                                src={rightSelectedProduct.image}
                                width="320"
                                height="320"
                                layout="fixed"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="divide-y space-y-3">
                        <div className="mt-4 text-2xl">
                          {
                            leftSelectedProduct?.attribute_data?.name[
                              channelName
                            ][locale || 'ru']
                          }{' '}
                          +{' '}
                          {
                            rightSelectedProduct?.attribute_data?.name[
                              channelName
                            ][locale || 'ru']
                          }
                        </div>
                        <div className="pt-3">
                          <div className="text-xl">
                            {
                              leftSelectedProduct?.attribute_data?.name[
                                channelName
                              ][locale || 'ru']
                            }
                          </div>
                          <div
                            className="text-xs text-gray-400"
                            dangerouslySetInnerHTML={{
                              __html: leftSelectedProduct?.attribute_data
                                ?.description
                                ? leftSelectedProduct?.attribute_data
                                    ?.description[channelName][locale || 'ru']
                                : '',
                            }}
                          ></div>
                        </div>
                        <div className="pt-3">
                          <div className="text-xl">
                            {
                              rightSelectedProduct?.attribute_data?.name[
                                channelName
                              ][locale || 'ru']
                            }
                          </div>
                          <div
                            className="text-xs text-gray-400"
                            dangerouslySetInnerHTML={{
                              __html: rightSelectedProduct?.attribute_data
                                ?.description
                                ? rightSelectedProduct?.attribute_data
                                    ?.description[channelName][locale || 'ru']
                                : '',
                            }}
                          ></div>
                        </div>
                      </div>
                      {modifiers.length > 0 && (
                        <div>
                          <div className="my-2">
                            <span>{tr('add_to_pizza')}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {modifiers.map((mod: any) => (
                              <div
                                key={mod.id}
                                className={`border ${
                                  activeModifiers.includes(mod.id) ||
                                  (!activeModifiers.length && mod.price == 0)
                                    ? 'border-yellow'
                                    : 'border-gray-300'
                                } flex flex-col justify-between overflow-hidden rounded-[15px] cursor-pointer`}
                                onClick={() => addModifier(mod.id)}
                              >
                                <div className="flex-grow pt-2 px-2">
                                  {mod.assets.length ? (
                                    <Image
                                      src={
                                        mod.assets[0].local
                                          ? mod.assets[0].local
                                          : `${webAddress}/storage/${mod.assets[0]?.location}/${mod.assets[0]?.filename}`
                                      }
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
                                  {locale == 'uz' ? mod.name_uz : mod.name}
                                </div>
                                <div
                                  className={`${
                                    activeModifiers.includes(mod.id) ||
                                    (!activeModifiers.length && mod.price == 0)
                                      ? 'bg-yellow'
                                      : 'bg-gray-300'
                                  } font-bold px-4 py-2 text-center text-white text-xs`}
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
                      )}
                    </div>
                    <div className="w-full pt-3">
                      {!activeModifiers.length ? (
                        <button
                          className="bg-gray-300 w-full rounded-3xl cursor-not-allowed px-10 py-2 text-white mt-7"
                          ref={completeButtonRef}
                        >
                          {tr('main_to_basket')}
                        </button>
                      ) : (
                        <button
                          className="bg-yellow w-full rounded-3xl px-10 py-2 text-white mt-7 flex items-center justify-around"
                          ref={completeButtonRef}
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
                              {currency(totalSummary, {
                                pattern: '# !',
                                separator: ' ',
                                decimal: '.',
                                symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                                precision: 0,
                              }).format()}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex fixed w-full max-h-32 flex-col">
                      <div className="flex w-full items-center">
                        <span onClick={closeModal} className="flex">
                          <Image
                            src="/assets/back.png"
                            width="24"
                            height="24"
                          />
                        </span>
                        <div className="text-lg flex-grow text-center -ml-10">
                          {tr('pizza')} 50/50 <br />{' '}
                          {tr('combine_your_two_favorite')}
                        </div>
                      </div>
                      <div className="flex justify-center mt-5 space-x-4 w-full -ml-4">
                        {customNames.map((name: string) => (
                          <button
                            key={name}
                            className={`${
                              name == activeCustomName
                                ? 'bg-yellow text-white'
                                : 'bg-gray-200 text-gray-400'
                            } rounded-3xl  px-5 py-2`}
                            onClick={() => changeCustomName(name)}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-around mt-32 h-[calc(100%-220px)] overflow-hidden overflow-y-auto">
                      <div className="text-center">
                        {readyProductList &&
                          readyProductList.map((item: any) => (
                            <div
                              key={item.id}
                              className={`rounded-3xl bg-white m-4 relative p-2 shadow-xl border ${
                                leftSelectedProduct &&
                                leftSelectedProduct.id == item.id
                                  ? 'border-yellow'
                                  : 'border-transparent'
                              }
                            ${
                              rightSelectedProduct &&
                              rightSelectedProduct.id == item.id
                                ? 'opacity-25'
                                : 'cursor-pointer hover:border-yellow'
                            }  `}
                              onClick={() => {
                                if (
                                  rightSelectedProduct &&
                                  rightSelectedProduct.id == item.id
                                )
                                  return
                                setLeftSelectedProduct(item)
                              }}
                            >
                              {leftSelectedProduct &&
                                leftSelectedProduct.id == item.id && (
                                  <div className="absolute right-2 top-2">
                                    <CheckIcon className=" h-4 text-yellow border border-yellow rounded-full w-4" />
                                  </div>
                                )}
                              <Image
                                src={item.image}
                                width="110"
                                height="110"
                              />
                              <div className="uppercase">
                                {
                                  item?.attribute_data?.name[channelName][
                                    locale || 'ru'
                                  ]
                                }
                              </div>
                              <div className="text-gray-400">
                                {currency(item.price, {
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
                      <div className="text-center">
                        {readyProductList &&
                          readyProductList.map((item: any) => (
                            <div
                              key={item.id}
                              className={`rounded-3xl bg-white m-4 p-2 shadow-xl border relative  ${
                                rightSelectedProduct &&
                                rightSelectedProduct.id == item.id
                                  ? 'border-yellow'
                                  : 'border-transparent'
                              }
                            ${
                              leftSelectedProduct &&
                              leftSelectedProduct.id == item.id
                                ? 'opacity-25'
                                : 'cursor-pointer hover:border-yellow'
                            }
                            `}
                              onClick={() => {
                                if (
                                  leftSelectedProduct &&
                                  leftSelectedProduct.id == item.id
                                )
                                  return
                                setRightSelectedProduct(item)
                              }}
                            >
                              {rightSelectedProduct &&
                                rightSelectedProduct.id == item.id && (
                                  <div className="absolute right-2 top-2">
                                    <CheckIcon className=" h-4 text-yellow border border-yellow rounded-full w-4" />
                                  </div>
                                )}
                              <Image
                                src={item.image}
                                width="110"
                                height="110"
                              />
                              <div className="uppercase">
                                {
                                  item?.attribute_data?.name[channelName][
                                    locale || 'ru'
                                  ]
                                }
                              </div>
                              <div className="text-gray-400">
                                {currency(item.price, {
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
                    <div className="w-full pt-3">
                      <div className="flex w-full justify-between text-center divide-x">
                        <div className="flex-grow py-2">
                          {leftSelectedProduct && (
                            <span>
                              {
                                leftSelectedProduct?.attribute_data?.name[
                                  channelName
                                ][locale || 'ru']
                              }
                            </span>
                          )}
                        </div>
                        <div className="flex-grow py-2">
                          {rightSelectedProduct && (
                            <span>
                              {
                                rightSelectedProduct?.attribute_data?.name[
                                  channelName
                                ][locale || 'ru']
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className={`${
                          leftSelectedProduct && rightSelectedProduct
                            ? 'bg-yellow cursor-pointer'
                            : 'bg-gray-300 cursor-not-allowed'
                        } w-full rounded-3xl px-10 py-2 text-white my-2 flex items-center justify-around`}
                        ref={completeButtonRef}
                        disabled={!leftSelectedProduct || !rightSelectedProduct}
                        onClick={changeToSecondPage}
                      >
                        {tr('connect_halves')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

export default memo(CreateYourPizza)
