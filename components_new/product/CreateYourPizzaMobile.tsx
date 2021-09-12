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

type CreatePizzaProps = {
  sec: any
  channelName: string
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const CreateYourPizza: FC<CreatePizzaProps> = ({ sec, channelName }) => {
  const router = useRouter()
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
    let selectedModifiers: any[] = [...activeModifiers]
    let allModifiers = [...modifiers]
    if (selectedModifiers.length == 0) {
      let freeModifiers = allModifiers.find((mod: any) => mod.price == 0)
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

    let basketId = localStorage.getItem('basketId')

    if (basketId) {
      await axios.post(`${webAddress}/api/baskets-lines`, {
        basket_id: basketId,
        variants: [
          {
            id: leftProduct.id,
            quantity: 1,
            modifiers: selectedModifiers,
          },
        ],
      })
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines`,
        {
          basket_id: basketId,
          variants: [
            {
              id: rightProduct.id,
              quantity: 1,
              modifiers: selectedModifiers,
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
              id: leftProduct.id,
              quantity: 1,
              modifiers: selectedModifiers,
            },
          ],
        }
      )
      await axios.post(`${webAddress}/api/baskets-lines`, {
        basket_id: basketData.data.id,
        variants: [
          {
            id: rightProduct.id,
            quantity: 1,
            modifiers: selectedModifiers,
          },
        ],
      })
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
        res += +mod.price * 2
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
    if (activeModifiers.includes(id)) {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == id)
      if (!currentModifier) return
      if (currentModifier.price == 0) return
      setActiveModifeirs([...activeModifiers.filter((modId) => modId != id)])
    } else {
      setActiveModifeirs([...activeModifiers, id])
    }
  }
  useEffect(() => {
    setActiveCustomName(customNames[0])
  }, [customNames])

  return (
    <>
      <div className="gap-4 grid grid-cols-2 py-4 md:py-0 items-center justify-between md:flex md:flex-col">
        <div className="text-center">
          <div className="text-lg font-bold mb-2">Создай свою пиццу</div>
          <div>
            <Image src="/createYourPizza.png" width="250" height="250" />
          </div>
          <div className="mt-10">
            <button
              className="bg-gray-100 focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-center text-yellow uppercase"
              onClick={openModal}
            >
              Создать пиццу
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
                <div className="flex fixed w-full max-h-32 flex-col">
                  <div className="flex w-full items-center">
                    <span onClick={closeModal} className="flex">
                      <Image src="/assets/back.png" width="24" height="24" />
                    </span>
                    <div className="text-lg flex-grow text-center -ml-10">
                      Пицца 50/50 <br /> Соедини 2 любимых вкуса
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
                          <Image src={item.image} width="110" height="110" />
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
                              symbol: 'сум',
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
                          <Image src={item.image} width="110" height="110" />
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
                              symbol: 'сум',
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
                    className="bg-yellow w-full rounded-3xl px-10 py-2 text-white my-2 flex items-center justify-around"
                    ref={completeButtonRef}
                  >
                    Соединить половинки
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

export default memo(CreateYourPizza)
