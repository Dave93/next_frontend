'use client'

import { memo, FC, useState, useRef, useMemo, useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'
import { useLocale } from 'next-intl'
import currency from 'currency.js'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useCart } from '@framework/cart'
import { useUI } from '@components/ui/context'
import { DateTime } from 'luxon'
import getAssetUrl from '@utils/getAssetUrl'

type CreatePizzaProps = {
  sec: any
  channelName: string
}

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const CreateYourPizzaMobileApp: FC<CreatePizzaProps> = ({
  sec,
  channelName,
}) => {
  const locale = useLocale()
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  const { locationData } = useUI()
  const { mutate } = useCart()
  const [isLoadingBasket, setIsLoadingBasket] = useState(false)
  const [activeModifiers, setActiveModifeirs] = useState([] as number[])
  const [activeCustomName, setActiveCustomName] = useState('')
  const [leftSelectedProduct, setLeftSelectedProduct] = useState(null as any)
  const [rightSelectedProduct, setRightSelectedProduct] = useState(null as any)
  const [isSecondPage, setIsSecondPage] = useState(false)
  const [configData, setConfigData] = useState({} as any)

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
    } catch (e) {}
  }

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const changeCustomName = (name: string) => {
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

    selectedModifiers = allModifiers
      .filter((m: any) => selectedModifiers.includes(m.id))
      .map((m: any) => ({ id: m.id }))

    let leftProduct = leftSelectedProduct.variants.find((v: any) => {
      if (locale == 'uz') {
        return v?.custom_name_uz == activeCustomName
      } else if (locale == 'ru') {
        return v?.custom_name == activeCustomName
      } else if (locale == 'en') {
        return v?.custom_name_en == activeCustomName
      }
    })

    let rightProduct = rightSelectedProduct.variants.find((v: any) => {
      if (locale == 'uz') {
        return v?.custom_name_uz == activeCustomName
      } else if (locale == 'ru') {
        return v?.custom_name == activeCustomName
      } else if (locale == 'en') {
        return v?.custom_name_en == activeCustomName
      }
    })

    if (leftProduct.modifierProduct) {
      modifierProduct = leftProduct.modifierProduct
    }

    if (selectedModifiers.length && modifierProduct) {
      if ([...activeModifiers].includes(modifierProduct.id)) {
        leftProduct = modifierProduct

        if (rightProduct.modifierProduct) {
          rightProduct = rightProduct.modifierProduct
        }
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
          selectedModifiers = []
        }
      }
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
              id: leftProduct.id,
              quantity: 1,
              modifiers: selectedModifiers,
              child: {
                id: rightProduct.id,
                quantity: 1,
                modifiers: [],
              },
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
              id: leftProduct.id,
              quantity: 1,
              modifiers: selectedModifiers,
              child: {
                id: rightProduct.id,
                quantity: 1,
                modifiers: [],
              },
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
        } else if (locale == 'ru') {
          names[vars?.custom_name] = vars?.custom_name
        } else if (locale == 'en') {
          names[vars?.custom_name_en] = vars?.custom_name_en
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
        } else if (locale == 'ru') {
          if (vars?.custom_name == activeCustomName) {
            res.price = vars.price
          }
        } else if (locale == 'en') {
          if (vars?.custom_name_en == activeCustomName) {
            res.price = vars.price
          }
        }
      })
      res.beforePrice = 0

      if (
        locationData &&
        configData.discount_end_date &&
        locationData.deliveryType == 'pickup' &&
        locationData.terminal_id &&
        configData.discount_catalog_sections
          .split(',')
          .map((i: string) => +i)
          .includes(res.category_id)
      ) {
        if (DateTime.now().toFormat('E') != configData.discount_disable_day) {
          if (
            DateTime.now() <= DateTime.fromSQL(configData.discount_end_date)
          ) {
            if (configData.discount_value) {
              res.beforePrice = res.price
              res.price = res.price * ((100 - configData.discount_value) / 100)
            }
          }
        }
      }
      return res
    })
  }, [sec, activeCustomName, locationData, configData])

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
      } else if (locale == 'ru') {
        if (vars?.custom_name == activeCustomName) {
          leftModifiers = vars.modifiers
        }
      } else if (locale == 'en') {
        if (vars?.custom_name_en == activeCustomName) {
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
      } else if (locale == 'ru') {
        if (vars?.custom_name == activeCustomName) {
          activeVariant = vars
        }
      } else if (locale == 'en') {
        if (vars?.custom_name_en == activeCustomName) {
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
          name_uz: "Sosiskali bo'rt",
          price:
            +activeVariant.modifierProduct.price -
            +activeVariant.price +
            (+rightActiveVariant?.modifierProduct.price -
              +rightActiveVariant?.price),
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
      } else if (locale == 'ru') {
        if (vars?.custom_name == activeCustomName) {
          activeVariant = vars
        }
      } else if (locale == 'en') {
        if (vars?.custom_name_en == activeCustomName) {
          activeVariant = vars
        }
      }
    })
    if (activeVariant.modifierProduct) {
      modifierProduct = activeVariant.modifierProduct
    }
    if (activeModifiers.includes(id)) {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == id)
      if (!currentModifier) return
      if (currentModifier.price == 0) return
      let resultModifiers = [
        ...activeModifiers.filter((modId) => modId != id),
      ].filter((id) => id)
      setActiveModifeirs(resultModifiers)
    } else {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == id)
      if (currentModifier.price == 0) {
        setActiveModifeirs([id])
      } else {
        let selectedModifiers = [...activeModifiers, id]

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
    fetchConfig()
    setActiveCustomName(customNames[0])
  }, [customNames])

  useEffect(() => {
    if (modifiers.length > 0 && activeModifiers.length === 0) {
      const freeModifier = modifiers.find((m: any) => m.price == 0)
      if (freeModifier) {
        setActiveModifeirs([freeModifier.id])
      }
    }
  }, [modifiers])

  return (
    <>
      <div className="gap-4 grid grid-cols-2 py-4 md:py-0 items-center justify-between md:flex md:flex-col">
        <div className="text-center">
          <div>
            <Image src="/createYourPizza.png" width={250} height={250} alt="" />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold mb-2">
            {'Соберите свою пиццу'}
          </div>
          <div className="mt-10">
            <button
              className="bg-gray-100 focus:outline-none font-bold outline-none px-6 py-2 text-sm rounded-full text-center text-yellow uppercase"
              onClick={openModal}
            >
              {'Собрать пиццу'}
            </button>
          </div>
        </div>
      </div>
      <Transition show={isOpen}>
        <Dialog
          initialFocus={completeButtonRef}
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="flex items-end justify-center min-h-screen  text-center sm:block sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="bg-white p-4 text-left transform h-screen w-full fixed top-0 flex flex-col overflow-hidden">
                {isSecondPage ? (
                  <>
                    <div className="flex my-2 w-full max-h-10 flex-col">
                      <div className="flex w-full items-center">
                        <button
                          onClick={() => setIsSecondPage(false)}
                          className="flex p-2 z-10 relative"
                          type="button"
                        >
                          <img
                            src="/assets/back.png"
                            width="24"
                            height="24"
                            alt="back"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                      <div
                        className="h-80 w-80 mx-auto bg-cover flex relative"
                        style={{ backgroundImage: 'url(/createYourPizza.png)' }}
                      >
                        <div className="w-40 relative overflow-hidden">
                          {leftSelectedProduct && (
                            <img
                              src={leftSelectedProduct.image}
                              width="320"
                              height="320"
                              className="absolute h-full max-w-none"
                              alt=""
                            />
                          )}
                        </div>
                        <div className="w-40 relative overflow-hidden">
                          {rightSelectedProduct && (
                            <img
                              src={rightSelectedProduct.image}
                              width="320"
                              height="320"
                              className="absolute h-full max-w-none right-0"
                              alt=""
                            />
                          )}
                        </div>
                      </div>
                      <div className="mt-4 text-lg font-semibold text-center">
                        {leftSelectedProduct?.attribute_data?.name[channelName][locale || 'ru']}
                        {' + '}
                        {rightSelectedProduct?.attribute_data?.name[channelName][locale || 'ru']}
                      </div>
                      {(leftSelectedProduct?.attribute_data?.description?.[channelName]?.[locale || 'ru'] ||
                        rightSelectedProduct?.attribute_data?.description?.[channelName]?.[locale || 'ru']) && (
                        <div className="divide-y space-y-2 mt-2">
                          {leftSelectedProduct?.attribute_data?.description?.[channelName]?.[locale || 'ru'] && (
                            <div className="pt-2">
                              <div className="text-sm font-medium">
                                {leftSelectedProduct?.attribute_data?.name[channelName][locale || 'ru']}
                              </div>
                              <div
                                className="text-xs text-gray-400"
                                dangerouslySetInnerHTML={{
                                  __html: leftSelectedProduct.attribute_data.description[channelName][locale || 'ru'],
                                }}
                              ></div>
                            </div>
                          )}
                          {rightSelectedProduct?.attribute_data?.description?.[channelName]?.[locale || 'ru'] && (
                            <div className="pt-2">
                              <div className="text-sm font-medium">
                                {rightSelectedProduct?.attribute_data?.name[channelName][locale || 'ru']}
                              </div>
                              <div
                                className="text-xs text-gray-400"
                                dangerouslySetInnerHTML={{
                                  __html: rightSelectedProduct.attribute_data.description[channelName][locale || 'ru'],
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      )}
                      {modifiers.length > 0 && (
                        <div>
                          <div className="my-2">
                            <span>{'Добавить к пицце'}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {modifiers.filter((mod: any) => mod.price > 0).map((mod: any) => (
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
                                <div className="flex-grow pt-2 px-2 flex justify-center">
                                  <img
                                    src={getAssetUrl(mod.assets)}
                                    width={80}
                                    height={80}
                                    alt={mod.name}
                                  />
                                </div>
                                <div className="px-2 text-center text-xs pb-1">
                                  {locale == 'uz'
                                    ? mod.name_uz || mod.name
                                    : locale == 'en'
                                    ? mod.name_en || mod.name
                                    : mod.name_ru || mod.name}
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
                                    symbol: `${locale == 'uz' ? "so'm" : ''}
                                      ${locale == 'ru' ? 'сум' : ''}
                                      ${locale == 'en' ? 'sum' : ''}
                                      `,
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
                          className="bg-gray-300 w-full rounded-3xl cursor-not-allowed px-10 py-2 text-white"
                          ref={completeButtonRef}
                        >
                          {'В корзину'}
                        </button>
                      ) : (
                        <button
                          className="bg-yellow w-full rounded-3xl px-10 py-2 text-white flex items-center justify-around"
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
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <span>
                              {'В корзину'}{' '}
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
                    <div className="flex w-full max-h-32 flex-col">
                      <div className="flex w-full items-center">
                        <button onClick={closeModal} className="flex p-2 z-10 relative" type="button">
                          <img
                            src="/assets/back.png"
                            width="24"
                            height="24"
                            alt="back"
                          />
                        </button>
                        <div className="text-lg flex-grow text-center -ml-10">
                          {'Пицца'} 50/50 <br />{' '}
                          {'Соедини свои два любимых вкуса'}
                        </div>
                      </div>
                      <div className="flex justify-center mt-5 mb-2 space-x-4 w-full">
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
                    {(leftSelectedProduct || rightSelectedProduct) && (
                      <div className="sticky top-0 z-10 bg-white py-2">
                        <div className="flex items-center justify-center">
                          <div className="relative w-32 h-32">
                            {leftSelectedProduct ? (
                              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                <img
                                  src={leftSelectedProduct.image}
                                  className="w-32 h-32 object-contain"
                                  alt=""
                                />
                              </div>
                            ) : (
                              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-gray-300 text-3xl">?</span>
                                </div>
                              </div>
                            )}
                            {rightSelectedProduct ? (
                              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 50%)' }}>
                                <img
                                  src={rightSelectedProduct.image}
                                  className="w-32 h-32 object-contain"
                                  alt=""
                                />
                              </div>
                            ) : (
                              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 50%)' }}>
                                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-gray-300 text-3xl">?</span>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-px h-full bg-gray-300"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-around flex-grow overflow-hidden overflow-y-auto">
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
                              <div className="flex justify-center">
                                <img
                                  src={item.image}
                                  width="110"
                                  height="110"
                                  alt=""
                                />
                              </div>
                              <div className="uppercase">
                                {
                                  item?.attribute_data?.name[channelName][
                                    locale || 'ru'
                                  ]
                                }
                              </div>
                              <div className="text-gray-400 flex flex-col">
                                {item.beforePrice > 0 && (
                                  <span className="line-through text-sm">
                                    {currency(item.beforePrice, {
                                      pattern: '# !',
                                      separator: ' ',
                                      decimal: '.',
                                      symbol: `${
                                        locale == 'uz' ? "so'm" : 'сум'
                                      }`,
                                      precision: 0,
                                    }).format()}
                                  </span>
                                )}
                                <span>
                                  {currency(item.price, {
                                    pattern: '# !',
                                    separator: ' ',
                                    decimal: '.',
                                    symbol: `${
                                      locale == 'uz' ? "so'm" : 'сум'
                                    }`,
                                    precision: 0,
                                  }).format()}
                                </span>
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
                              <div className="flex justify-center">
                                <img
                                  src={item.image}
                                  width="110"
                                  height="110"
                                  alt=""
                                />
                              </div>
                              <div className="uppercase">
                                {
                                  item?.attribute_data?.name[channelName][
                                    locale || 'ru'
                                  ]
                                }
                              </div>
                              <div className="text-gray-400 flex flex-col">
                                {item.beforePrice > 0 && (
                                  <span className="line-through text-sm">
                                    {currency(item.beforePrice, {
                                      pattern: '# !',
                                      separator: ' ',
                                      decimal: '.',
                                      symbol: `${
                                        locale == 'uz' ? "so'm" : 'сум'
                                      }`,
                                      precision: 0,
                                    }).format()}
                                  </span>
                                )}
                                <span>
                                  {currency(item.price, {
                                    pattern: '# !',
                                    separator: ' ',
                                    decimal: '.',
                                    symbol: `${
                                      locale == 'uz' ? "so'm" : 'сум'
                                    }`,
                                    precision: 0,
                                  }).format()}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="w-full pt-3">
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
                        {'Соединить половинки'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default memo(CreateYourPizzaMobileApp)
