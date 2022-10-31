import { FC, Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon, XIcon } from '@heroicons/react/outline'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'
import { DateTime } from 'luxon'
import axios from 'axios'
import getConfig from 'next/config'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useCart } from '@framework/cart'

type ThreePizzaProps = {
  sec: any
  channelName: string
  isSmall?: boolean
}
const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const ThreePizza: FC<ThreePizzaProps> = ({ sec, channelName }) => {
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale } = router
  const { stopProducts, locationData } = useUI()
  const [configData, setConfigData] = useState({} as any)
  const [activeCustomName, setActiveCustomName] = useState('')
  const [selected, setSelected] = useState([] as number[])
  const [isLoadingBasket, setIsLoadingBasket] = useState(false)
  const { mutate } = useCart()

  console.log(selected)

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

  const readyProductList: any[] = useMemo(() => {
    return sec.items.map((item: any) => {
      let res = item

      res.isInStop = false

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

  const selectProduct = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i != id))
    } else {
      if (selected.length < 3) {
        setSelected([...selected, id])
      } else {
        setSelected([selected[0], selected[1], id])
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

  const addToBasket = async () => {
    setIsLoadingBasket(true)
    await setCredentials()

    let basketId = localStorage.getItem('basketId')
    const otpToken = Cookies.get('opt_token')

    let basketResult = {}

    if (basketId) {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines`,
        {
          basket_id: basketId,
          variants: [{}],
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
    }

    await mutate(basketResult, false)
    setIsLoadingBasket(false)
  }

  useEffect(() => {
    fetchConfig()
  }, [customNames])

  return (
    <div className="container mx-auto">
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="border-primary border-2 rounded-2xl p-3">
          three pizza modal
        </div>
      </div>
      <Transition show={isOpen} as={Fragment}>
        <Dialog
          initialFocus={completeButtonRef}
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              <div className="inline-block align-bottom bg-white p-5 rounded-3xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle container sm:w-full">
                <button
                  className="absolute focus:outline-none outline-none -right-10 top-2"
                  onClick={() => setIsOpen(false)}
                >
                  <XIcon className="cursor-pointer h-7 text-white w-7" />
                </button>
                <div className="grid md:grid-cols-3 gap-10 container">
                  {readyProductList.map((item: any) => (
                    <div
                      className={`hover:shadow-lg rounded-3xl flex md:flex-col items-center justify-center border hover:border-yellow p-4 cursor-pointer relative gap-1 ${
                        selected.includes(item.id) ? 'border-yellow' : ''
                      }`}
                      key={item.id}
                      onClick={() => selectProduct(item.id)}
                    >
                      <div className="text-center">
                        <div className="">
                          {selected.includes(item.id) && (
                            <div className="absolute right-4">
                              <CheckIcon className=" text-yellow border border-yellow rounded-full w-10" />
                            </div>
                          )}
                          <Image src={item.image} width="200" height="200" />
                        </div>
                        <div key={item.id} className="text-xl">
                          {
                            item?.attribute_data?.name[channelName][
                              locale || 'ru'
                            ]
                          }
                        </div>
                      </div>
                      <div
                        className="mt-1 flex-grow text-center w-1/2 md:w-full"
                        dangerouslySetInnerHTML={{
                          __html: item?.attribute_data?.description
                            ? item?.attribute_data?.description[channelName][
                                locale || 'ru'
                              ]
                            : '',
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
                <button
                  className="bg-yellow w-full rounded-3xl px-10 py-2 text-white mt-7 flex items-center justify-around"
                  ref={completeButtonRef}
                  onClick={addToBasket}
                >
                  {isLoadingBasket && (
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
                  )}
                  {tr('main_to_basket')}
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default ThreePizza
