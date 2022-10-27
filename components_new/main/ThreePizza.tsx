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

  useEffect(() => {
    fetchConfig()
  }, [customNames])

  return (
    <div className="container mx-auto">
      <div
        className="w-1/3 cursor-pointer border-primary border-2 rounded-md p-2"
        onClick={() => setIsOpen(true)}
      >
        <div>three pizza modal</div>
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
              <div className="inline-block align-bottom bg-white p-10 rounded-3xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle container sm:w-full">
                <button
                  className="absolute focus:outline-none outline-none -right-10 top-2"
                  onClick={() => setIsOpen(false)}
                >
                  <XIcon className="cursor-pointer h-7 text-white w-7" />
                </button>
                <div className="grid grid-cols-3 gap-10 container">
                  {readyProductList.map((item: any) => (
                    <div className="hover:shadow-lg rounded-lg flex flex-col items-center justify-center border border-yellow p-2 cursor-pointer">
                      <div key={item.id} className="">
                        {selected == item.id && (
                          <div className="absolute right-2 top-2">
                            <CheckIcon className=" h-4 text-yellow border border-yellow rounded-full w-4" />
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
                      <div
                        className="mt-1 flex-grow"
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
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default ThreePizza
