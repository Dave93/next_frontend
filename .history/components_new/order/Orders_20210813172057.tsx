import { XIcon } from '@heroicons/react/outline'
import { useForm, Controller } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, {
  Fragment,
  useState,
  useMemo,
  FC,
  memo,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import { Menu, Transition, Disclosure, Dialog } from '@headlessui/react'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/solid'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
} from 'react-yandex-maps'
import Image from 'next/image'
import { useCart } from '@framework/cart'
import currency from 'currency.js'
import getConfig from 'next/config'
import axios from 'axios'
import { debounce } from 'lodash'
import Downshift from 'downshift'
import Select from '@components_new/utils/Select'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

// interface LocationTabProps {
//   setOpen: Dispatch<SetStateAction<boolean>>
// }

type FormData = {
  name: string
  address: string
  phone: string
  email: string
  flat: string
  house: string
  entrance: string
  door_code: string
  change: string
  pay_comment: string
  card_number: string
  card_month: string
  holder_name: string
  cvv_code: string
  deliveryDay: string
  deliveryTime: string
  payType: string
}
interface SelectItem {
  value: string
  label: string
}

const deliveryTimeOptions = [] as SelectItem[]

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, '0')

Array.from(Array(24).keys()).map((item: number) => {
  let val = `${zeroPad(item, 2)}:${zeroPad(0, 2)}`
  deliveryTimeOptions.push({
    value: val,
    label: val,
  })
  val = `${zeroPad(item, 2)}:${zeroPad(30, 2)}`
  deliveryTimeOptions.push({
    value: val,
    label: val,
  })

  return item
})

const paymentTypes = ['payme', 'click', 'oson']

const Orders: FC = () => {
  //Contacts
  const { t: tr } = useTranslation('common')
  const { user, setUserData, locationData, setLocationData } = useUI()
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }

  const router = useRouter()

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  })
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: user?.user?.name,
      phone: user?.user?.phone,
      email: '',
      address: locationData?.address || '',
      flat: locationData?.flat || '',
      house: locationData?.house || '',
      entrance: locationData?.entrance || '',
      door_code: locationData?.door_code || '',
      change: '',
      pay_comment: '',
      card_number: '',
      card_month: '',
      holder_name: '',
      cvv_code: '',
      deliveryDay: '',
      deliveryTime: '',
      payType: '',
    },
  })

  const onSubmit = (data: any) => console.log(JSON.stringify(data))

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

  const authName = watch('name')
  const authPhone = watch('phone')
  const authEmail = watch('email')

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }
  //Orders
  const dayOptions = [
    {
      value: 'today',
      label: tr('today'),
    },
    {
      value: 'tomorrow',
      label: tr('tomorrow'),
    },
  ]
  const [tabIndex, setTabIndex] = useState(
    locationData?.deliveryType || 'deliver'
  )
  const [pickupIndex, setPickupIndex] = useState(1)
  const [cities, setCities] = useState([
    {
      id: 'tash',
      label: 'Ташкент',
      active: true,
      mapCenter: [41.311158, 69.279737],
      mapZoom: 11.76,
    },
    {
      id: 'ferg',
      label: 'Фергана',
      active: false,
      mapCenter: [40.38942, 71.783009],
      mapZoom: 12.73,
    },
    {
      id: 'sam',
      label: 'Самарканд',
      active: false,
      mapCenter: [39.654522, 66.96883],
      mapZoom: 13.06,
    },
  ])
  const [pickupPoints, setPickupPoint] = useState([] as any[])
  const [activePoint, setActivePoint] = useState(
    (locationData ? locationData.terminal_id : null) as number | null
  )

  const [geoSuggestions, setGeoSuggestions] = useState([])
  const [selectedCoordinates, setSelectedCoordinates] = useState(
    locationData && locationData.location
      ? [
          {
            coordinates: {
              lat: locationData.location[0],
              long: locationData.location[1],
            },
            key: `${locationData.location[0]}${locationData.location[1]}`,
          },
        ]
      : ([] as any)
  )

  const activeLabel = cities.find((item) => item.active)?.label
  const activeCity = cities.find((item) => item.active)

  const [mapCenter, setMapCenter] = useState(
    (locationData?.location || activeCity?.mapCenter) as number[]
  )
  const [mapZoom, setMapZoom] = useState(
    ((locationData?.location ? 17 : 10) || activeCity?.mapZoom) as number
  )

  const [configData, setConfigData] = useState({} as any)
  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(
        `${publicRuntimeConfig.apiUrl}/api/configs/public`
      )
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

  useEffect(() => {
    fetchConfig()
    if (locationData && locationData.deliveryType == 'pickup') {
      loadPickupItems()
    }
    return
  }, [locationData])

  const addressInputChangeHandler = async (event: any) => {
    if (!configData) {
      return []
    }

    if (!configData.yandexGeoKey) {
      return []
    }
    const { data: getCodeData } = await axios.get(
      `/api/geocode?text=${encodeURI(event.target.value)}`
    )

    setGeoSuggestions(getCodeData)
  }

  const debouncedAddressInputChangeHandler = useCallback(
    debounce(addressInputChangeHandler, 300),
    [configData]
  )

  const setActive = (id: string) => {
    setCities(
      cities.map((item) => {
        if (item.id == id) {
          item.active = true
        } else {
          item.active = false
        }
        return item
      })
    )
  }

  const setSelectedAddress = (selection: any) => {
    setMapCenter([selection.coordinates.lat, selection.coordinates.long])
    setSelectedCoordinates([
      {
        ...selection,
        key: `${selection.coordinates.lat}${selection.coordinates.long}`,
      },
    ])
    setMapZoom(17)
    setLocationData({
      ...locationData,
      location: [selection.coordinates.lat, selection.coordinates.long],
    })
    setValue('address', selection.title)
    searchTerminal({
      ...locationData,
      location: [selection.coordinates.lat, selection.coordinates.long],
    })
  }

  const clickOnMap = (event: any) => {
    const coords = event.get('coords')
    setMapCenter(coords)
    setSelectedCoordinates([
      {
        key: `${coords[0]}${coords[1]}`,
        coordinates: {
          lat: coords[0],
          long: coords[1],
        },
      },
    ])
    setMapZoom(17)
    setLocationData({ ...locationData, location: coords })
    searchTerminal({ ...locationData, location: coords })
  }

  const mapState = useMemo<MapState>(() => {
    const baseState: MapStateBase = {
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
    }
    const mapStateCenter: MapStateCenter = {
      center: mapCenter || [],
      zoom: mapZoom || 10,
    }

    const res: MapState = Object.assign({}, baseState, mapStateCenter)
    return res
  }, [mapCenter, mapZoom])
  // time of delivery
  const [deliveryActive, setDeliveryActive] = useState(1)
  // pay
  const [openTab, setOpenTab] = useState(1)
  const [payType, setPayType] = useState('')

  const onValueChange = (e: any) => {
    setPayType(e.target.value)
  }

  //pay final
  const [sms, smsSetChecked] = useState(false)
  const [newsletter, newsSetChecked] = useState(false)

  const smsValueChange = (e: any) => {
    smsSetChecked(e.target.checked)
  }
  const newsletterValueChange = (e: any) => {
    newsSetChecked(e.target.checked)
  }

  let [isShowPrivacy, setIsShowPrivacy] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  const showPrivacy = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setIsShowPrivacy(true)
  }

  const closePrivacy = () => {
    setIsShowPrivacy(false)
  }
  let privacyButtonRef = useRef(null)

  const changeTabIndex = async (index: string) => {
    setLocationData({ ...locationData, deliveryType: index })

    if (index == 'pickup') {
      await loadPickupItems()
    }

    setTabIndex(index)
  }

  const loadPickupItems = async () => {
    const { data } = await axios.get(
      `${publicRuntimeConfig.apiUrl}/api/terminals/pickup`
    )
    let res: any[] = []
    data.data.map((item: any) => {
      if (item.latitude) {
        res.push(item)
      }
    })
    setPickupPoint(res)
  }

  const choosePickupPoint = (pointId: number) => {
    setActivePoint(pointId)
    setLocationData({
      ...locationData,
      terminal_id: pointId,
    })
  }

  const searchTerminal = async (locationData: any = {}) => {
    if (!locationData || !locationData.location) {
      toast.warn(tr('no_address_specified'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setLocationData({
        ...locationData,
        terminal_id: undefined,
      })
      return
    }

    const { data: terminalsData } = await axios.get(
      `${publicRuntimeConfig.apiUrl}/api/terminals/find_nearest?lat=${locationData.location[0]}&lon=${locationData.location[1]}`
    )

    if (terminalsData.data && !terminalsData.data.items.length) {
      toast.warn(
        terminalsData.data.message
          ? terminalsData.data.message
          : tr('restaurant_not_found'),
        {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        }
      )
      setLocationData({
        ...locationData,
        terminal_id: undefined,
      })
      return
    }

    if (terminalsData.data) {
      setLocationData({
        ...locationData,
        terminal_id: terminalsData.data.items[0].id,
        terminalData: terminalsData.data.items[0],
      })
    }
  }

  const saveOrder = async () => {
    setIsSavingOrder(true)
    await setCredentials()
    try {
      const { data } = await axios.post(`${webAddress}/api/orders`, {
        formData: { ...locationData, ...getValues() },
        basket_id: cartId,
      })

      setIsSavingOrder(false)
      localStorage.removeItem('basketId')
      router.push(`/order/success/?id=${data.data.id}`)
    } catch (e) {
      toast.error(e.response.data.error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setIsSavingOrder(false)
    }
    // if (Object.keys(errors).length) {
    //   console.log(errors)
    // }
  }

  // console.log(errors)

  if (errors.payType) {
    toast.error(tr('payment_system_not_selected'), {
      position: toast.POSITION.BOTTOM_RIGHT,
      hideProgressBar: true,
    })
  }

  if (errors.deliveryDay || errors.deliveryTime) {
    toast.error(tr('delivery_time_not_specified'), {
      position: toast.POSITION.BOTTOM_RIGHT,
      hideProgressBar: true,
    })
  }

  return (
    <>
      {/* Contacts */}
      <div className="w-full bg-white my-5 rounded-2xl">
        <div className="md:p-10">
          <div className="text-lg mb-5 font-bold">
            {tr('order_your_contacts')}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="md:w-80">
            <div className="mt-8">
              <label className="text-sm text-gray-400 mb-2 block">
                {tr('personal_data_name')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('name', { required: true })}
                  className="focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-100 text-gray-400"
                />
                {authName && (
                  <button
                    className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                    onClick={() => resetField('name')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
              {errors.name && (
                <div className="text-sm text-center text-red-600">
                  {tr('required')}
                </div>
              )}
            </div>
            <div className="mt-8">
              <label className="text-sm text-gray-400 mb-2 block">
                {tr('personal_phone')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('phone', {
                    required: true,
                    pattern: /^\+998\d\d\d\d\d\d\d\d\d$/i,
                  })}
                  className="focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-100 text-gray-400 "
                />
                {authPhone && (
                  <button
                    className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                    onClick={() => resetField('phone')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>

              {errors.phone && (
                <div className="text-sm text-center text-red-600">
                  {tr('required')}
                </div>
              )}
            </div>
            <div className="mt-8">
              <label className="text-sm text-gray-400 mb-2 block">
                {tr('personal_email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className="focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-100 text-gray-400 "
                />
                {authEmail && (
                  <button
                    className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                    onClick={() => resetField('email')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Orders */}
      <div className="mb-5">
        <div className="bg-white flex rounded-2xl w-full items-center p-10 h-32 mb-5">
          <div className="bg-gray-100 flex  w-full rounded-full">
            <button
              className={`${
                tabIndex == 'deliver'
                  ? 'bg-yellow text-white'
                  : ' text-gray-400'
              } flex-1 font-bold py-3 text-[18px] rounded-full outline-none focus:outline-none`}
              onClick={() => changeTabIndex('deliver')}
            >
              {tr('delivery')}
            </button>
            <button
              className={`${
                tabIndex == 'pickup' ? 'bg-yellow text-white' : ' text-gray-400'
              } flex-1 font-bold py-3 text-[18px] rounded-full outline-none focus:outline-none`}
              onClick={() => changeTabIndex('pickup')}
            >
              {tr('pickup')}
            </button>
          </div>
        </div>
        {tabIndex == 'deliver' && (
          <div className="bg-white p-10 rounded-2xl">
            <div className="flex justify-between">
              <div className="text-gray-400 font-bold text-lg">
                {tr('chooseLocation')}
              </div>
              <div>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="focus:outline-none font-medium inline-flex justify-center px-4 py-2 text-secondary text-sm w-full">
                      {activeLabel}
                      <ChevronDownIcon
                        className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="z-20 absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {cities.map((item) => (
                        <Menu.Item key={item.id}>
                          <span
                            onClick={() => setActive(item.id)}
                            className={`block px-4 py-2 text-sm cursor-pointer ${
                              item.active
                                ? 'bg-secondary text-white'
                                : 'text-secondary'
                            }`}
                          >
                            {item.label}
                          </span>
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
            <div>
              <YMaps>
                <div>
                  <Map
                    state={mapState}
                    width="100%"
                    height="530px"
                    onClick={clickOnMap}
                    modules={[
                      'control.ZoomControl',
                      'control.FullscreenControl',
                      'control.GeolocationControl',
                    ]}
                  >
                    {selectedCoordinates.map((item: any, index: number) => (
                      <Placemark
                        modules={['geoObject.addon.balloon']}
                        defaultGeometry={[
                          item?.coordinates?.lat,
                          item?.coordinates?.long,
                        ]}
                        geomerty={[
                          item?.coordinates?.lat,
                          item?.coordinates?.long,
                        ]}
                        key={item.key}
                        defaultOptions={{
                          iconLayout: 'default#image',
                          iconImageHref: '/map_placemark.png',
                        }}
                      />
                    ))}
                  </Map>
                </div>
              </YMaps>
            </div>
            <div className="mt-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="font-bold text-lg">{tr('address')}</div>
                <div className="mt-3 space-y-6">
                  <div className="flex justify-between w-full">
                    <Downshift
                      onChange={(selection) => setSelectedAddress(selection)}
                      itemToString={(item) => (item ? item.formatted : '')}
                      initialInputValue={locationData?.address || ''}
                    >
                      {({
                        getInputProps,
                        getItemProps,
                        getLabelProps,
                        getMenuProps,
                        isOpen,
                        inputValue,
                        highlightedIndex,
                        selectedItem,
                        getRootProps,
                      }) => (
                        <>
                          <div
                            className="relative w-7/12"
                            {...getRootProps(undefined, {
                              suppressRefError: true,
                            })}
                          >
                            <input
                              type="text"
                              {...register('address', { required: true })}
                              {...getInputProps({
                                onChange: debouncedAddressInputChangeHandler,
                              })}
                              placeholder={tr('address')}
                              className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                            />
                            <ul
                              {...getMenuProps()}
                              className="absolute w-full z-[1000] rounded-[15px] shadow-lg"
                            >
                              {isOpen
                                ? geoSuggestions.map(
                                    (item: any, index: number) => (
                                      <li
                                        {...getItemProps({
                                          key: index,
                                          index,
                                          item,
                                          className: `py-2 px-4 flex items-center ${
                                            highlightedIndex == index
                                              ? 'bg-gray-100'
                                              : 'bg-white'
                                          }`,
                                        })}
                                      >
                                        <CheckIcon
                                          className={`w-5 text-yellow font-bold mr-2 ${
                                            highlightedIndex == index
                                              ? ''
                                              : 'invisible'
                                          }`}
                                        />
                                        <div>
                                          <div>{item.title}</div>
                                          <div className="text-sm">
                                            {item.description}
                                          </div>
                                        </div>
                                      </li>
                                    )
                                  )
                                : null}
                            </ul>
                          </div>
                        </>
                      )}
                    </Downshift>
                    <div className="mx-5 w-3/12">
                      <input
                        type="text"
                        {...register('flat')}
                        placeholder={tr('flat')}
                        className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                      />
                    </div>
                    <div className="w-2/12">
                      <input
                        type="text"
                        {...register('house')}
                        placeholder={tr('house')}
                        className="bg-gray-100 px-8 py-3 rounded-full w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <Disclosure defaultOpen={true}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex text-yellow outline-none focus:outline-none">
                          <span>{tr('indicate_intercom_and_entrance')}</span>
                          {/*
                          Use the `open` render prop to rotate the icon when the panel is open
                        */}
                          <ChevronRightIcon
                            className={`w-6 transform ${
                              open ? 'rotate-90' : '-rotate-90'
                            }`}
                          />
                        </Disclosure.Button>
                        <Transition
                          show={open}
                          enter="transition duration-300 ease-out"
                          enterFrom="transform scale-95 opacity-0"
                          enterTo="transform scale-100 opacity-100"
                          leave="transition duration-300 ease-out"
                          leaveFrom="transform scale-100 opacity-100"
                          leaveTo="transform scale-95 opacity-0"
                        >
                          <Disclosure.Panel>
                            <div className="flex mt-3">
                              <div>
                                <input
                                  type="text"
                                  {...register('entrance')}
                                  placeholder={tr('entrance')}
                                  className="bg-gray-100 px-8 py-2 rounded-full w-60  outline-none focus:outline-none"
                                />
                              </div>
                              <div className="mx-5">
                                <input
                                  type="text"
                                  {...register('door_code')}
                                  placeholder={tr('door_code')}
                                  className="bg-gray-100 px-8 py-2 rounded-full w-60 outline-none focus:outline-none"
                                />
                              </div>
                            </div>
                          </Disclosure.Panel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>
                </div>
              </form>
            </div>
          </div>
        )}
        {tabIndex == 'pickup' && (
          <div className="bg-white p-10 rounded-2xl">
            <div>
              <div className="font-bold text-[18px] text-gray-400">
                {tr('search_for_the_nearest_restaurant')}
              </div>
              <div className="flex mt-3">
                <div
                  className={`${
                    pickupIndex == 1 ? ' text-yellow' : 'text-gray-400'
                  } cursor-pointer font-bold text-[18px] mr-5`}
                  onClick={() => {
                    setPickupIndex(1)
                  }}
                >
                  {tr('on_the_map')}
                </div>
                <div
                  className={`${
                    pickupIndex == 2 ? ' text-yellow' : 'text-gray-400'
                  } cursor-pointer font-bold text-[18px]`}
                  onClick={() => {
                    setPickupIndex(2)
                  }}
                >
                  {tr('list')}
                </div>
              </div>
            </div>
            <div className="w-full mt-5">
              <input
                type="text"
                {...register('address')}
                placeholder={tr('address')}
                className="bg-gray-100 px-8 rounded-full w-full outline-none focus:outline-none py-2"
              />
            </div>
            <div className="mt-5">
              {pickupIndex == 1 && (
                <>
                  <YMaps>
                    <div>
                      <Map
                        defaultState={{
                          center: [40.351706, 69.090118],
                          zoom: 7.2,
                          controls: [
                            'zoomControl',
                            'fullscreenControl',
                            'geolocationControl',
                          ],
                        }}
                        width="100%"
                        height="520px"
                        modules={[
                          'control.ZoomControl',
                          'control.FullscreenControl',
                          'control.GeolocationControl',
                        ]}
                      >
                        {pickupPoints.map((point) => (
                          <Placemark
                            modules={['geoObject.addon.balloon']}
                            defaultGeometry={[point.latitude, point.longitude]}
                            key={point.id}
                            onClick={() => choosePickupPoint(point.id)}
                            options={{
                              iconColor:
                                activePoint && activePoint == point.id
                                  ? '#FAAF04'
                                  : '#1E98FF',
                            }}
                            properties={{
                              balloonContentBody: `<b>${point.name}</b> <br />
                          ${point.desc}
                          `,
                            }}
                            defaultOptions={{
                              iconLayout: 'default#image',
                              iconImageHref: '/map_placemark.png',
                            }}
                          />
                        ))}
                      </Map>
                    </div>
                  </YMaps>
                </>
              )}
              {pickupIndex == 2 && (
                <div className="gap-5 grid grid-cols-2">
                  {pickupPoints.map((point) => (
                    <div
                      key={point.id}
                      className={`border flex items-start p-3 rounded-[15px] cursor-pointer ${
                        activePoint && activePoint == point.id
                          ? 'border-yellow'
                          : 'border-gray-400'
                      }`}
                      onClick={() => choosePickupPoint(point.id)}
                    >
                      <div
                        className={`border mr-4 mt-1 rounded-full ${
                          activePoint && activePoint == point.id
                            ? 'border-yellow'
                            : 'border-gray-400'
                        }`}
                      >
                        <div
                          className={`h-3 m-1 rounded-full w-3 ${
                            activePoint && activePoint == point.id
                              ? 'bg-yellow'
                              : 'bg-gray-400'
                          }`}
                        ></div>
                      </div>
                      <div>
                        <div className="font-bold">{point.name}</div>
                        <div className="text-gray-400 text-sm">
                          {point.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* time of delivery */}
      <div className="w-full bg-white mb-5 rounded-2xl p-10">
        <div className="text-lg mb-5 font-bold">
          {tr('order_time_of_delivery')}
        </div>
        <div>
          <button
            className={`${
              deliveryActive == 1
                ? 'bg-yellow text-white'
                : 'text-gray-400 bg-gray-100'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44`}
            onClick={() => setDeliveryActive(1)}
          >
            {tr('hurry_up')}
          </button>
          <button
            className={`${
              deliveryActive == 2
                ? 'bg-yellow text-white'
                : 'text-gray-400 bg-gray-100'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 ml-5`}
            onClick={() => setDeliveryActive(2)}
          >
            {tr('later')}
          </button>
        </div>
        {deliveryActive == 2 && (
          <div className="mt-8 flex">
            <Controller
              render={({ field: { onChange } }) => (
                <Select
                  items={dayOptions}
                  placeholder={tr('today')}
                  onChange={(e: any) => onChange(e)}
                />
              )}
              rules={{
                required: true,
              }}
              key="deliveryDay"
              name="deliveryDay"
              control={control}
            />
            <Controller
              render={({ field: { onChange } }) => (
                <Select
                  items={deliveryTimeOptions}
                  placeholder={tr('time')}
                  onChange={(e: any) => onChange(e)}
                  className="ml-5"
                />
              )}
              rules={{
                required: true,
              }}
              key="deliveryTime"
              name="deliveryTime"
              control={control}
            />
          </div>
        )}
      </div>
      {/* pay */}
      <div className="w-full bg-white mb-5 rounded-2xl p-10 relative">
        {!locationData?.terminal_id && (
          <div className="absolute w-full h-full -ml-10 -mt-10 bg-opacity-60 bg-gray-100 z-20 items-center flex justify-around">
            <div className="text-yellow font-bold text-2xl">
              {tr('no_address_no_restaurant')}
            </div>
          </div>
        )}
        <div className="text-lg mb-5 font-bold">{tr('order_pay')}</div>
        <div>
          <button
            className={`${
              openTab !== 1
                ? 'text-gray-400 bg-gray-100'
                : 'bg-yellow text-white'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44`}
            onClick={() => setOpenTab(1)}
          >
            {tr('in_cash')}
          </button>
          {/* <button
            className={`${
              openTab !== 2
                ? 'text-gray-400 bg-gray-100'
                : 'bg-yellow text-white'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 ml-5`}
            onClick={() => setOpenTab(2)}
          >
            Картой
          </button> */}
          <button
            className={`${
              openTab !== 3
                ? 'text-gray-400 bg-gray-100'
                : 'bg-yellow text-white'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 ml-5`}
            onClick={() => setOpenTab(3)}
          >
            {tr('online')}
          </button>
        </div>
        <div className={openTab === 1 ? 'block' : 'hidden'} id="link1">
          <input
            type="number"
            {...register('change', { required: openTab === 1 })}
            className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-80 bg-gray-100 text-gray-400 mt-8"
            placeholder={tr('change')}
          />
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex text-yellow outline-none focus:outline-none mt-8">
                  <span>{tr('comment_on_the_order')}</span>
                  {/*
                          Use the `open` render prop to rotate the icon when the panel is open
                        */}
                  <ChevronRightIcon
                    className={`w-6 transform ${
                      open ? 'rotate-90' : '-rotate-90'
                    }`}
                  />
                </Disclosure.Button>
                <Transition
                  show={open}
                  enter="transition duration-300 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-300 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel>
                    <div className="flex mt-3 w-96 h-28">
                      <div>
                        <textarea
                          {...register('pay_comment')}
                          className="w-96 h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none"
                          placeholder="Ваш коментарии увидет только куръер"
                        ></textarea>
                      </div>
                    </div>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        </div>
        <div className={openTab === 2 ? 'block' : 'hidden'} id="link2">
          <div className="flex w-[460px] justify-between pt-8 items-center">
            <label className="flex justify-around items-center w-24 h-24 p-3 rounded-2xl border-gray-200 border cursor-pointer">
              <img src="/assets/uzcard.png" />
              <input
                type="radio"
                defaultValue="uzcard"
                checked={payType === 'uzcard'}
                onChange={onValueChange}
                className="hidden"
              />
            </label>
            <label className="flex justify-around items-center w-24 h-24 p-3 rounded-2xl border-gray-200 border cursor-pointer">
              <img src="/assets/visa.png" />
              <input
                type="radio"
                defaultValue="visa"
                onChange={onValueChange}
                checked={payType === 'visa'}
                className="hidden"
              />
            </label>
            <label className="flex justify-around items-center w-24 h-24 p-3 rounded-2xl border-gray-200 border cursor-pointer">
              <img src="/assets/humo.png" />
              <input
                type="radio"
                defaultValue="humo"
                onChange={onValueChange}
                checked={payType === 'humo'}
                className="hidden"
              />
            </label>
            <label className="flex justify-around items-center w-24 h-24 p-3 rounded-2xl border-gray-200 border cursor-pointer">
              <img src="/assets/mastercard.png" />
              <input
                type="radio"
                defaultValue="mastercard"
                onChange={onValueChange}
                checked={payType === 'mastercard'}
                className="hidden"
              />
            </label>
          </div>
          <div className="md:w-[460px] pt-10">
            <div className="flex justify-between">
              <input
                type="text"
                {...register('card_number')}
                placeholder="Номер карты"
                className="bg-gray-100 px-8 py-2 rounded-full w-80  outline-none focus:outline-none"
              />
              <input
                type="text"
                {...register('card_month')}
                placeholder="ММ/ГГ"
                className="bg-gray-100 px-10 py-2 rounded-full w-32  outline-none focus:outline-none"
              />
            </div>
            <div className="flex justify-between pt-5">
              <input
                type="text"
                {...register('holder_name')}
                placeholder={tr('holder_name')}
                className="bg-gray-100 px-8 py-2 rounded-full w-80  outline-none focus:outline-none"
              />
              <input
                type="text"
                {...register('cvv_code')}
                placeholder="CVV код"
                className="bg-gray-100 px-10 py-2 rounded-full w-32  outline-none focus:outline-none"
              />
            </div>
          </div>
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex text-yellow outline-none focus:outline-none mt-8">
                  <span>{tr('comment_on_the_order')}</span>
                  {/*
                          Use the `open` render prop to rotate the icon when the panel is open
                        */}
                  <ChevronRightIcon
                    className={`w-6 transform ${
                      open ? 'rotate-90' : '-rotate-90'
                    }`}
                  />
                </Disclosure.Button>
                <Transition
                  show={open}
                  enter="transition duration-300 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-300 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel>
                    <div className="flex mt-3 w-96 h-28">
                      <div>
                        <textarea
                          {...register('pay_comment')}
                          className="w-96 h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none"
                          placeholder="Ваш коментарии увидет только куръер"
                        ></textarea>
                      </div>
                    </div>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        </div>
        <div className={openTab === 3 ? 'block' : 'hidden'} id="link3">
          <div className="justify-between pt-8 items-center grid grid-cols-4 w-6/12">
            {locationData?.terminal_id &&
              paymentTypes
                .filter(
                  (payment: string) =>
                    !!locationData?.terminalData[`${payment}_active`]
                )
                .map((payment: string) => (
                  <label
                    className={`flex justify-around items-center w-24 h-24 p-3 rounded-2xl ${
                      payType == payment ? 'border-yellow' : 'border-gray-200'
                    } border cursor-pointer`}
                    key={payment}
                  >
                    <img src={`/assets/${payment}.png`} />
                    <input
                      type="radio"
                      {...register('payType', { required: openTab === 3 })}
                      defaultValue={payment}
                      checked={payType === payment}
                      onChange={onValueChange}
                      className="hidden"
                    />
                  </label>
                ))}
          </div>
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex text-yellow outline-none focus:outline-none mt-8">
                  <span>{tr('comment_on_the_order')} </span>
                  {/*
                          Use the `open` render prop to rotate the icon when the panel is open
                        */}
                  <ChevronRightIcon
                    className={`w-6 transform ${
                      open ? 'rotate-90' : '-rotate-90'
                    }`}
                  />
                </Disclosure.Button>
                <Transition
                  show={open}
                  enter="transition duration-300 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-300 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel>
                    <div className="flex mt-3 w-96 h-28">
                      <div>
                        <textarea
                          {...register('pay_comment')}
                          className="w-96 h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none"
                          placeholder="Ваш коментарии увидет только куръер"
                        ></textarea>
                      </div>
                    </div>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        </div>
      </div>
      {/* order list */}
      <div className="w-full bg-white mb-5 rounded-2xl p-10">
        <div className="text-lg mb-5 font-bold">{tr('order_order_list')}</div>
        {!isEmpty &&
          data &&
          data?.lineItems.map((lineItem: any) => (
            <div
              className="flex justify-between items-center border-b py-2"
              key={lineItem.id}
            >
              <Image
                src={
                  lineItem?.variant?.data?.product?.data?.assets?.data.length
                    ? lineItem?.variant?.data?.product?.data?.assets?.data[0]
                        .url
                    : '/no_photo.svg'
                }
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-grow mx-2">
                <div className="font-bold text-xl mb-2">
                  {lineItem?.variant?.data?.product?.data?.name}
                </div>
              </div>
              <div className="text-xl">
                {currency(lineItem.unit_price * lineItem.quantity, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol: 'сўм',
                  precision: 0,
                }).format()}
              </div>
            </div>
          ))}
        {!isEmpty && (
          <div className="flex justify-between items-center mt-8">
            <div>
              <div className="font-bold text-xl mb-2">
                {tr('basket_order_price')}
              </div>
            </div>
            <div className="text-2xl font-bold">
              {currency(data.totalPrice, {
                pattern: '# !',
                separator: ' ',
                decimal: '.',
                symbol: 'сўм',
                precision: 0,
              }).format()}
            </div>
          </div>
        )}
      </div>
      <div className="w-full bg-white mb-5 rounded-2xl p-10">
        <div className="flex">
          <div className="mr-8 text-gray-400">{tr('agree_to_send')}</div>
          <label className="mr-8 cursor-pointer text-gray-400 items-center flex">
            <input
              type="checkbox"
              defaultValue="sms"
              className={` ${
                sms ? 'text-yellow' : 'bg-gray-200'
              } form-checkbox h-5 w-5  rounded-md  mr-2`}
              onChange={smsValueChange}
            />
            <div>SMS</div>
          </label>
          <label className="cursor-pointer text-gray-400 items-center flex">
            <input
              type="checkbox"
              defaultValue="newsletter"
              className={` ${
                newsletter ? 'text-yellow' : 'bg-gray-200'
              } form-checkbox h-5 w-5  rounded-md mr-2`}
              onChange={newsletterValueChange}
            />
            <div>E-mail {tr('mailing')}</div>
          </label>
        </div>
        <div className="mt-5 text-gray-400 text-sm flex border-b pb-8">
          {tr('processing_of_your_personal_data')}
          <a
            href="/privacy"
            onClick={showPrivacy}
            className="text-yellow block mx-1"
            target="_blank"
          >
            {tr('terms_of_use')}
          </a>
        </div>
        <Transition appear show={isShowPrivacy} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={closePrivacy}
            initialFocus={privacyButtonRef}
          >
            <div className="min-h-screen px-4 text-center">
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
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="align-middle inline-block overflow-hidden w-full">
                  <div className="inline-flex my-8 items-start">
                    <div className="align-middle bg-white inline-block max-w-4xl overflow-hidden p-10 rounded-2xl shadow-xl text-left transform transition-all w-full">
                      <div className="border-b mb-3 pb-3">
                        <Dialog.Title
                          as="h3"
                          className="leading-6 mb-2 text-2xl"
                        >
                          1. ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ (ОФЕРТА)
                        </Dialog.Title>
                        <p>
                          The standard Lorem Ipsum passage, used since the 1500s
                          "Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit, sed do eiusmod tempor incididunt ut labore et
                          dolore magna aliqua. Ut enim ad minim veniam, quis
                          nostrud exercitation ullamco laboris nisi ut aliquip
                          ex ea commodo consequat. Duis aute irure dolor in
                          reprehenderit in voluptate velit esse cillum dolore eu
                          fugiat nulla pariatur. Excepteur sint occaecat
                          cupidatat non proident, sunt in culpa qui officia
                          deserunt mollit anim id est laborum."
                        </p>
                      </div>
                      <div className="border-b mb-3 pb-3">
                        <Dialog.Title
                          as="h3"
                          className="leading-6 mb-2 text-2xl"
                        >
                          2. Предмет Пользовательского соглашения
                        </Dialog.Title>
                        <p>
                          "Sed ut perspiciatis unde omnis iste natus error sit
                          voluptatem accusantium doloremque laudantium, totam
                          rem aperiam, eaque ipsa quae ab illo inventore
                          veritatis et quasi architecto beatae vitae dicta sunt
                          explicabo. Nemo enim ipsam voluptatem quia voluptas
                          sit aspernatur aut odit aut fugit, sed quia
                          consequuntur magni dolores eos qui ratione voluptatem
                          sequi nesciunt. Neque porro quisquam est, qui dolorem
                          ipsum quia dolor sit amet, consectetur, adipisci
                          velit, sed quia non numquam eius modi tempora incidunt
                          ut labore et dolore magnam aliquam quaerat voluptatem.
                          Ut enim ad minima veniam, quis nostrum exercitationem
                          ullam corporis suscipit laboriosam, nisi ut aliquid ex
                          ea commodi consequatur? Quis autem vel eum iure
                          reprehenderit qui in ea voluptate velit esse quam
                          nihil molestiae consequatur, vel illum qui dolorem eum
                          fugiat quo voluptas nulla pariatur?"
                        </p>
                      </div>
                      <div className="border-b mb-3 pb-3">
                        <Dialog.Title
                          as="h3"
                          className="leading-6 mb-2 text-2xl"
                        >
                          3. Регистрация на Сайте и безопасность
                        </Dialog.Title>
                        <p>
                          "But I must explain to you how all this mistaken idea
                          of denouncing pleasure and praising pain was born and
                          I will give you a complete account of the system, and
                          expound the actual teachings of the great explorer of
                          the truth, the master-builder of human happiness. No
                          one rejects, dislikes, or avoids pleasure itself,
                          because it is pleasure, but because those who do not
                          know how to pursue pleasure rationally encounter
                          consequences that are extremely painful. Nor again is
                          there anyone who loves or pursues or desires to obtain
                          pain of itself, because it is pain, but because
                          occasionally circumstances occur in which toil and
                          pain can procure him some great pleasure. To take a
                          trivial example, which of us ever undertakes laborious
                          physical exercise, except to obtain some advantage
                          from it? But who has any right to find fault with a
                          man who chooses to enjoy a pleasure that has no
                          annoying consequences, or one who avoids a pain that
                          produces no resultant pleasure?"
                        </p>
                      </div>
                      <div className="border-b mb-3 pb-3">
                        <Dialog.Title
                          as="h3"
                          className="leading-6 mb-2 text-2xl"
                        >
                          4. Интеллектуальная собственность и авторское право
                        </Dialog.Title>
                        <p>
                          "At vero eos et accusamus et iusto odio dignissimos
                          ducimus qui blanditiis praesentium voluptatum deleniti
                          atque corrupti quos dolores et quas molestias
                          excepturi sint occaecati cupiditate non provident,
                          similique sunt in culpa qui officia deserunt mollitia
                          animi, id est laborum et dolorum fuga. Et harum quidem
                          rerum facilis est et expedita distinctio. Nam libero
                          tempore, cum soluta nobis est eligendi optio cumque
                          nihil impedit quo minus id quod maxime placeat facere
                          possimus, omnis voluptas assumenda est, omnis dolor
                          repellendus. Temporibus autem quibusdam et aut
                          officiis debitis aut rerum necessitatibus saepe
                          eveniet ut et voluptates repudiandae sint et molestiae
                          non recusandae. Itaque earum rerum hic tenetur a
                          sapiente delectus, ut aut reiciendis voluptatibus
                          maiores alias consequatur aut perferendis doloribus
                          asperiores repellat."
                        </p>
                      </div>
                      <div className="border-b mb-3 pb-3">
                        <Dialog.Title
                          as="h3"
                          className="leading-6 mb-2 text-2xl"
                        >
                          5. Права и обязанности Поверенного
                        </Dialog.Title>
                        <p>
                          "On the other hand, we denounce with righteous
                          indignation and dislike men who are so beguiled and
                          demoralized by the charms of pleasure of the moment,
                          so blinded by desire, that they cannot foresee the
                          pain and trouble that are bound to ensue; and equal
                          blame belongs to those who fail in their duty through
                          weakness of will, which is the same as saying through
                          shrinking from toil and pain. These cases are
                          perfectly simple and easy to distinguish. In a free
                          hour, when our power of choice is untrammelled and
                          when nothing prevents our being able to do what we
                          like best, every pleasure is to be welcomed and every
                          pain avoided. But in certain circumstances and owing
                          to the claims of duty or the obligations of business
                          it will frequently occur that pleasures have to be
                          repudiated and annoyances accepted. The wise man
                          therefore always holds in these matters to this
                          principle of selection: he rejects pleasures to secure
                          other greater pleasures, or else he endures pains to
                          avoid worse pains."
                        </p>
                      </div>
                      <div className="border-b mb-3 pb-3">
                        <Dialog.Title
                          as="h3"
                          className="leading-6 mb-2 text-2xl"
                        >
                          6. Права и обязанности Пользователя
                        </Dialog.Title>
                        <p>
                          "But I must explain to you how all this mistaken idea
                          of denouncing pleasure and praising pain was born and
                          I will give you a complete account of the system, and
                          expound the actual teachings of the great explorer of
                          the truth, the master-builder of human happiness. No
                          one rejects, dislikes, or avoids pleasure itself,
                          because it is pleasure, but because those who do not
                          know how to pursue pleasure rationally encounter
                          consequences that are extremely painful. Nor again is
                          there anyone who loves or pursues or desires to obtain
                          pain of itself, because it is pain, but because
                          occasionally circumstances occur in which toil and
                          pain can procure him some great pleasure. To take a
                          trivial example, which of us ever undertakes laborious
                          physical exercise, except to obtain some advantage
                          from it? But who has any right to find fault with a
                          man who chooses to enjoy a pleasure that has no
                          annoying consequences, or one who avoids a pain that
                          produces no resultant pleasure?"
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-white outline-none focus:outline-none transform"
                      onClick={closePrivacy}
                      ref={privacyButtonRef}
                    >
                      <XIcon className="text-white cursor-pointer w-10 h-10" />
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
        <div className="flex justify-between mt-8">
          <button className="text-xl text-gray-400 bg-gray-200 flex h-12 items-center justify-between px-12 rounded-full w-80">
            <img src="/left.png" /> Вернуться в корзину
          </button>
          <button
            className={`text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full w-80 ${
              !locationData?.terminal_id ? 'opacity-25 cursor-not-allowed' : ''
            }`}
            disabled={!locationData?.terminal_id || isSavingOrder}
            onClick={handleSubmit(saveOrder)}
          >
            {isSavingOrder ? (
              <svg
                className="animate-spin h-5 mx-auto text-center text-white w-5"
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
              <>
                Оплатить <img src="/right.png" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

export default memo(Orders)
