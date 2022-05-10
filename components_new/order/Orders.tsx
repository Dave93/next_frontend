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
  LocationMarkerIcon,
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
import router, { useRouter } from 'next/router'
import OtpInput from 'react-otp-input'
import styles from './Orders.module.css'
import { DateTime } from 'luxon'
import Input from 'react-phone-number-input/input'
import { City } from '@commerce/types/cities'
import { chunk, sortBy } from 'lodash'
import getAddressList from '@lib/load_addreses'
import { Address } from '@commerce/types/address'
import Hashids from 'hashids'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

declare global {
  interface Window {
    b24order: any // 👈️ turn off type checking
  }
}

type FormData = {
  name: string
  address: string | null | undefined
  phone: string
  email: string
  flat: string
  house: string
  entrance: string
  door_code: string
  change: string
  notes: string
  card_number: string
  card_month: string
  holder_name: string
  cvv_code: string
  delivery_day: string
  delivery_time: string
  pay_type: string
  delivery_schedule: string
  label?: string
  addressId: number | null
}

interface SelectItem {
  value: string
  label: string
}

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, '0')

const paymentTypes = ['payme', 'click', 'oson']

interface Errors {
  [key: string]: string
}

const errors: Errors = {
  name_field_is_required:
    'Мы Вас не нашли в нашей системе. Просьба указать своё имя.',
  opt_code_is_incorrect: 'Введённый код неверный или срок кода истёк',
}

let otpTimerRef: NodeJS.Timeout

type OrdersProps = {
  channelName: any
}

const Orders: FC<OrdersProps> = ({ channelName }: { channelName: any }) => {
  const deliveryTimeOptions = [] as SelectItem[]

  let startTime = DateTime.now()
  startTime = startTime.plus({ minutes: 80 })
  startTime = startTime.set({
    minute: Math.ceil(startTime.minute / 10) * 10,
  })

  while (startTime.hour < 3 || startTime.hour > 10) {
    let val = `${zeroPad(startTime.hour, 2)}:${zeroPad(startTime.minute, 2)}`
    startTime = startTime.plus({ minutes: 20 })
    startTime = startTime.set({
      minute: Math.ceil(startTime.minute / 10) * 10,
    })

    val += ` - ${zeroPad(startTime.hour, 2)}:${zeroPad(startTime.minute, 2)}`
    deliveryTimeOptions.push({
      value: val,
      label: val,
    })

    startTime = startTime.plus({ minutes: 40 })
    startTime = startTime.set({
      minute: Math.ceil(startTime.minute / 10) * 10,
    })
  }
  //Contacts
  const { t: tr } = useTranslation('common')
  const {
    user,
    setUserData,
    locationData,
    setLocationData,
    cities,
    activeCity,
    setActiveCity,
    openSignInModal,
    addressId,
    setAddressId,
    setAddressList,
    addressList,
    selectAddress,
    setStopProducts,
    stopProducts,
  } = useUI()
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }

  const { locale, pathname, query } = useRouter()
  const downshiftControl = useRef<any>(null)
  const map = useRef<any>(null)
  const [ymaps, setYmaps] = useState<any>(null)
  const objects = useRef<any>(null)
  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
    locationData,
  })
  let currentAddress = ''
  if (activeCity.active) {
    if (locale == 'ru') {
      currentAddress = 'Узбекистан, ' + activeCity.name + ','
    } else {
      currentAddress = "O'zbekiston, " + activeCity.name_uz + ','
    }
  }
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
      email: user?.user?.email,
      address: locationData?.address || currentAddress,
      flat: locationData?.flat || '',
      house: locationData?.house || '',
      entrance: locationData?.entrance || '',
      door_code: locationData?.door_code || '',
      change: '',
      notes: '',
      card_number: '',
      card_month: '',
      holder_name: '',
      cvv_code: '',
      delivery_day: '',
      delivery_time: '',
      pay_type: '',
      delivery_schedule: 'now',
      label: locationData?.label || '',
      addressId: addressId || null,
    },
  })

  const {
    register: passwordFormRegister,
    handleSubmit: handlePasswordSubmit,
    formState: passwordFormState,
  } = useForm({
    mode: 'onChange',
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

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
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
  const [pickupPoints, setPickupPoint] = useState([] as any[])
  const [activePoint, setActivePoint] = useState(
    (locationData ? locationData.terminal_id : null) as number | null
  )
  const [isPhoneConfirmOpen, setIsPhoneConfirmOpen] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpShowCode, setOtpShowCode] = useState(0)
  const [yandexGeoKey, setYandexGeoKey] = useState('')

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

  let authButtonRef = useRef(null)
  const otpTime = useRef(0)

  const [mapCenter, setMapCenter] = useState(
    (locationData?.location && locationData.location.length
      ? locationData?.location
      : [activeCity?.lat, activeCity?.lon]) as number[]
  )
  const [mapZoom, setMapZoom] = useState(
    ((locationData?.location && locationData.location.length ? 17 : 10) ||
      activeCity?.map_zoom) as number
  )

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

    let yandexGeoKey = configData.yandexGeoKey
    yandexGeoKey = yandexGeoKey.split(',')
    // get random item from yandexGeoKey
    yandexGeoKey = yandexGeoKey[Math.floor(Math.random() * yandexGeoKey.length)]

    setYandexGeoKey(yandexGeoKey)
  }

  const loadAddresses = async () => {
    const addresses = await getAddressList()
    if (!addresses) {
      setAddressList(null)
    } else {
      setAddressList(addresses)
    }
  }

  const stopList = async () => {
    if (locationData?.terminalData) {
      const { data: terminalStock } = await axios.get(
        `${webAddress}/api/terminals/get_stock?terminal_id=${locationData?.terminalData.id}`
      )

      if (!terminalStock.success) {
        return
      } else {
        setStopProducts(terminalStock.data)
      }
      return
    }
  }

  useEffect(() => {
    stopList()
    fetchConfig()
    loadAddresses()
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
      `/api/geocode?text=${encodeURI(event.target.value)}&bounds=${
        activeCity.bounds
      }`
    )

    setGeoSuggestions(getCodeData)
  }

  const debouncedAddressInputChangeHandler = useCallback(
    debounce(addressInputChangeHandler, 300),
    [configData]
  )

  const setActive = (city: City) => {
    if (locale == 'uz') {
      setValue('address', "O'zbekiston, " + city.name_uz)
      downshiftControl?.current?.reset({
        inputValue: "O'zbekiston, " + city.name_uz + ',',
      })
    } else {
      setValue('address', 'Узбекистан, ' + city.name)
      downshiftControl?.current?.reset({
        inputValue: 'Узбекистан, ' + city.name + ',',
      })
    }
    setActiveCity(city)
    if (city) setMapCenter([+city.lat, +city.lon])
  }

  const setSelectedAddress = async (selection: any) => {
    setMapCenter([selection.coordinates.lat, selection.coordinates.long])
    setSelectedCoordinates([
      {
        ...selection,
        key: `${selection.coordinates.lat}${selection.coordinates.long}`,
      },
    ])
    setMapZoom(17)
    setValue('address', selection.formatted)
    downshiftControl?.current?.reset({
      inputValue: selection.formatted,
    })
    let house = ''
    selection.addressItems.map((address: any) => {
      if (address.kind == 'house') {
        setValue('house', address.name)
        house = address.name
      }
    })
    let terminalData = await searchTerminal(
      {
        location: [selection.coordinates.lat, selection.coordinates.long],
      },
      true
    )
    setLocationData({
      ...locationData,
      house: house,
      location: [selection.coordinates.lat, selection.coordinates.long],
      terminal_id: terminalData.terminal_id,
      terminalData: terminalData.terminalData,
    })
  }
  const changeCity = (city: City) => {
    let link = pathname
    Object.keys(query).map((k: string) => {
      if (k == 'city') {
        link = link.replace('[city]', city.slug)
      } else {
        link = link.replace(`[${k}]`, query[k]!.toString())
      }
    })
    router.push(link)
    setActiveCity(city)
  }

  const clickOnMap = async (event: any) => {
    const coords = event.get('coords') || event.get('position')
    let polygon = objects.current.searchContaining(coords).get(0)
    if (!polygon) {
      toast.warn(tr('point_delivery_not_available'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    } else {
      let pickedCity = cities.find(
        (city: City) => city.slug == polygon.properties._data.slug
      )

      if (pickedCity.id != activeCity.id) {
        changeCity(pickedCity)
      }
    }
    // setMapCenter(coords)
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
    const { data } = await axios.get(
      `${webAddress}/api/geocode?lat=${coords[0]}&lon=${coords[1]}`
    )
    let house = ''
    data.data.addressItems.map((item: any) => {
      if (item.kind == 'house') {
        house = item.name
      }
    })
    setValue('house', house)
    setValue('address', data.data.formatted)
    downshiftControl?.current?.reset({
      inputValue: data.data.formatted,
    })

    let terminalData = await searchTerminal(
      {
        location: coords,
      },
      true
    )
    setLocationData({
      ...locationData,
      location: coords,
      address: data.data.formatted,
      house,
      terminal_id: terminalData.terminal_id,
      terminalData: terminalData.terminalData,
    })
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
  }, [mapCenter, mapZoom, activeCity])
  // time of delivery
  const [deliveryActive, setDeliveryActive] = useState('now' as string)
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

  const setDeliverySchedule = (val: string) => {
    setValue('delivery_schedule', val)
    setDeliveryActive(val)
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
      `${webAddress}/api/terminals/pickup?city_id=${activeCity.id}`
    )

    let res: any[] = []
    let currentTime = DateTime.now()
    // currentTime = currentTime.set({ hour: 23 }) // TODO: remove this line
    let weekDay = currentTime.weekday
    data.data.map((item: any) => {
      if (item.latitude) {
        item.isWorking = false
        if (weekDay >= 1 && weekDay < 6) {
          let openWork = DateTime.fromISO(item.open_work)
          openWork = openWork.set({ day: currentTime.day })
          openWork = openWork.set({ year: currentTime.year })
          openWork = openWork.set({ month: currentTime.month })
          let closeWork = DateTime.fromISO(item.close_work)
          closeWork = closeWork.set({ day: currentTime.day })
          closeWork = closeWork.set({ year: currentTime.year })
          closeWork = closeWork.set({ month: currentTime.month })
          if (closeWork.hour < openWork.hour) {
            closeWork = closeWork.set({ day: currentTime.day + 1 })
          }

          if (currentTime >= openWork && currentTime < closeWork) {
            item.isWorking = true
          }
          item.workTimeStart = openWork.toFormat('HH:mm')
          item.workTimeEnd = closeWork.toFormat('HH:mm')
        } else {
          let openWork = DateTime.fromISO(item.open_weekend)
          openWork = openWork.set({ day: currentTime.day })
          openWork = openWork.set({ year: currentTime.year })
          openWork = openWork.set({ month: currentTime.month })
          let closeWork = DateTime.fromISO(item.close_weekend)
          closeWork = closeWork.set({ day: currentTime.day })
          closeWork = closeWork.set({ year: currentTime.year })
          closeWork = closeWork.set({ month: currentTime.month })
          if (closeWork.hour < openWork.hour) {
            closeWork = closeWork.set({ day: currentTime.day + 1 })
          }

          if (currentTime >= openWork && currentTime < closeWork) {
            item.isWorking = true
          }
          item.workTimeStart = openWork.toFormat('HH:mm')
          item.workTimeEnd = closeWork.toFormat('HH:mm')
        }

        res.push(item)
      }
    })
    setPickupPoint(res)
  }

  const choosePickupPoint = (point: any) => {
    if (!point.isWorking) {
      toast.warn(tr('terminal_is_not_working'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    }
    setActivePoint(point.id)
    let terminalData = pickupPoints.find((pickup: any) => pickup.id == point.id)
    setLocationData({
      ...locationData,
      terminal_id: point.id,
      terminalData,
    })
  }

  const searchTerminal = async (
    locationData: any = {},
    returnResult: boolean = false
  ) => {
    if (!locationData || !locationData.location) {
      toast.warn(tr('no_address_specified'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      // if returnResult is true, return object else return setLocationData
      return returnResult
        ? {
            terminal_id: undefined,
            terminalData: undefined,
          }
        : setLocationData({
            ...locationData,
            terminal_id: undefined,
            terminalData: undefined,
          })
    }

    const { data: terminalsData } = await axios.get(
      `${webAddress}/api/terminals/find_nearest?lat=${locationData.location[0]}&lon=${locationData.location[1]}`
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

      // if returnResult is true, return object else return setLocationData
      return returnResult
        ? {
            terminal_id: undefined,
            terminalData: undefined,
          }
        : setLocationData({
            ...locationData,
            terminal_id: undefined,
            terminalData: undefined,
          })
    } else {
      let currentTerminal = terminalsData.data.items[0]
      if (!currentTerminal.isWorking) {
        toast.warn(tr('nearest_terminal_is_closed'), {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        })
        return returnResult
          ? {
              terminal_id: undefined,
              terminalData: undefined,
            }
          : setLocationData({
              ...locationData,
              terminal_id: undefined,
              terminalData: undefined,
            })
      }
    }

    if (terminalsData.data) {
      // if returnResult is true, return object else return setLocationData
      return returnResult
        ? {
            terminal_id: terminalsData.data.items[0].id,
            terminalData: terminalsData.data.items[0],
          }
        : setLocationData({
            ...locationData,
            terminal_id: terminalsData.data.items[0].id,
            terminalData: terminalsData.data.items[0],
          })
    }
  }

  const handleOtpChange = (otp: string) => {
    setOtpCode(otp)
  }

  const startTimeout = () => {
    otpTimerRef = setInterval(() => {
      if (otpTime.current > 0) {
        otpTime.current = otpTime.current - 1
        setOtpShowCode(otpTime.current)
      } else {
        clearInterval(otpTimerRef)
      }
    }, 1000)
  }

  const prepareOrder = async () => {
    setIsSavingOrder(true)
    await setCredentials()
    try {
      const { data } = await axios.post(`${webAddress}/api/orders/prepare`, {
        formData: {
          ...locationData,
          ...getValues(),
          pay_type: payType,
          sms_sub: sms,
          email_sub: newsletter,
        },
        basket_id: cartId,
      })
      if (!data.success) {
        toast.error(data.message, {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        })
      } else {
        let success: any = Buffer.from(data.success, 'base64')
        success = success.toString()
        success = JSON.parse(success)
        Cookies.set('opt_token', success.user_token)
        otpTime.current = data?.time_to_answer
        setOtpShowCode(otpTime.current)
        startTimeout()
        setIsPhoneConfirmOpen(true)
      }
      setIsSavingOrder(false)
    } catch (e: any) {
      toast.error(e.response.data.error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setIsSavingOrder(false)
    }
  }

  const loadPolygonsToMap = (ymaps: any) => {
    setYmaps(ymaps)
    map.current.controls.remove('geolocationControl')
    var geolocationControl = new ymaps.control.GeolocationControl({
      options: { noPlacemark: true },
    })
    geolocationControl.events.add('locationchange', function (event: any) {
      var position = event.get('position'),
        // При создании метки можно задать ей любой внешний вид.
        locationPlacemark = new ymaps.Placemark(position)

      clickOnMap(event)
      // Установим новый центр карты в текущее местоположение пользователя.
      map.current.panTo(position)
    })
    map.current.controls.add(geolocationControl)
    let geoObjects: any = {
      type: 'FeatureCollection',
      metadata: {
        name: 'delivery',
        creator: 'Yandex Map Constructor',
      },
      features: [],
    }
    cities.map((city: any) => {
      if (city.polygons) {
        let arrPolygons = city.polygons.split(',').map((poly: any) => +poly)
        arrPolygons = chunk(arrPolygons, 2)
        arrPolygons = arrPolygons.map((poly: any) => sortBy(poly))
        let polygon: any = {
          type: 'Feature',
          id: 0,
          geometry: {
            type: 'Polygon',
            coordinates: [arrPolygons],
          },
          properties: {
            fill: '#FAAF04',
            fillOpacity: 0.1,
            stroke: '#FAAF04',
            strokeWidth: '7',
            strokeOpacity: 0.4,
            slug: city.slug,
          },
        }
        geoObjects.features.push(polygon)
      }
    })
    let deliveryZones = ymaps.geoQuery(geoObjects).addToMap(map.current)
    deliveryZones.each((obj: any) => {
      obj.options.set({
        fillColor: obj.properties.get('fill'),
        fillOpacity: obj.properties.get('fillOpacity'),
        strokeColor: obj.properties.get('stroke'),
        strokeWidth: obj.properties.get('strokeWidth'),
        strokeOpacity: obj.properties.get('strokeOpacity'),
      })
      obj.events.add('click', clickOnMap)
    })
    objects.current = deliveryZones
  }

  const saveOrder = async () => {
    if (!user) {
      return openSignInModal()
    }

    if (!locationData) {
      toast.warn(tr('location_tabs_incorrect_data'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    } else if (
      locationData.deliveryType === 'deliver' &&
      (!locationData.location || !locationData.location.length)
    ) {
      toast.warn(tr('location_tabs_incorrect_data'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    }

    setIsSavingOrder(true)
    await setCredentials()
    const otpToken = Cookies.get('opt_token')

    let sourceType = 'web'
    if (window.innerWidth < 768) {
      sourceType = 'mobile_web'
    }
    try {
      const { data } = await axios.post(
        `${webAddress}/api/orders`,
        {
          formData: {
            ...locationData,
            ...getValues(),
            pay_type: payType,
            sms_sub: sms,
            email_sub: newsletter,
            sourceType,
          },
          code: otpCode,
          basket_id: cartId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )

      setIsSavingOrder(false)
      clearInterval(otpTimerRef)
      // setUserData(data.user)
      localStorage.removeItem('basketId')

      let basketData = {
        id: '',
        createdAt: '',
        currency: { code: '' },
        taxesIncluded: '',
        lineItems: [],
        lineItemsSubtotalPrice: '',
        subtotalPrice: 0,
        totalPrice: 0,
        discountTotal: 0,
        discountValue: 0,
      }
      await mutate(basketData, false)
      const orderHashids = new Hashids(
        'order',
        15,
        'abcdefghijklmnopqrstuvwxyz1234567890'
      )
      router.push(`/${activeCity.slug}/order/${data.order.id}`)
      setTimeout(() => {
        console.log({
          id: orderHashids.decode(data.order.id),
          sum: data.order?.order_total / 100,
        })
        ;(window.b24order = window.b24order || []).push({
          id: orderHashids.decode(data.order.id)[0],
          sum: data.order?.order_total / 100,
        })
      }, 500)
    } catch (e: any) {
      toast.error(e.response.data.error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setIsSavingOrder(false)
    }
  }

  const otpTimerText = useMemo(() => {
    let text = 'Получить новый код через '
    const minutes: number = parseInt((otpShowCode / 60).toString(), 0)
    const seconds: number = otpShowCode % 60
    if (minutes > 0) {
      text += minutes + ' мин. '
    }

    if (seconds > 0) {
      text += seconds + ' сек.'
    }
    return text
  }, [otpShowCode])

  const getNewCode = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    prepareOrder()
  }

  if (errors.pay_type) {
    toast.error(tr('payment_system_not_selected'), {
      position: toast.POSITION.BOTTOM_RIGHT,
      hideProgressBar: true,
    })
  }

  if (errors.delivery_day || errors.delivery_time) {
    toast.error(tr('delivery_time_not_specified'), {
      position: toast.POSITION.BOTTOM_RIGHT,
      hideProgressBar: true,
    })
  }

  const selectAddressLocal = async (address: Address) => {
    if (address.id == addressId) {
      setAddressId(null)
    } else {
      if (address.lat && address.lon) {
        setSelectedCoordinates([
          {
            key: `${address.lat}${address.lon}`,
            coordinates: {
              lat: address.lat,
              long: address.lon,
            },
          },
        ])
        setMapZoom(17)
        setMapCenter([address.lat, address.lon])
        let terminalData = await searchTerminal(
          {
            location: [address.lat, address.lon],
          },
          true
        )

        let formValues = getValues()
        reset({
          ...formValues,
          address: address?.address || currentAddress,
          flat: address?.flat || '',
          house: address?.house || '',
          entrance: address?.entrance || '',
          door_code: address?.door_code || '',
          label: address?.label || '',
          addressId: address.id || null,
        })
        selectAddress({
          locationData: {
            ...address,
            location: [address.lat, address.lon],
            terminal_id: terminalData.terminal_id,
            terminalData: terminalData.terminalData,
          },
          addressId: address.id,
        })
      } else {
        selectAddress({
          locationData: {
            ...address,
            location: [],
            terminal_id: undefined,
            terminalData: undefined,
          },
          addressId: address.id,
        })
      }
    }
  }

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const addresClear = watch('address')

  const deleteAddress = async (addressId: number) => {
    await setCredentials()
    const otpToken = Cookies.get('opt_token')
    const response = await axios.delete(
      `${webAddress}/api/address/${addressId}`,
      {
        headers: {
          Authorization: `Bearer ${otpToken}`,
        },
      }
    )
    if (response.status === 200) {
      loadAddresses()
    }
  }

  const isWorkTime = useMemo(() => {
    let currentHour = new Date().getHours()
    // let currentHour = 4
    if (
      configData.workTimeStart <= currentHour ||
      configData.workTimeEnd > currentHour
    )
      return true
    return false
  }, [configData])

  const isProductInStop = useMemo(() => {
    let res: number[] = []
    if (!isEmpty) {
      data.lineItems.map((item: any) => {
        if (stopProducts.includes(item.variant.product_id)) {
          res.push(item.id)
        }
      })
    }
    return res
  }, [stopProducts, data])

  const totalPrice = useMemo(() => {
    let total = 0
    if (!isEmpty) {
      data.lineItems.map((lineItem: any) => {
        if (!stopProducts.includes(lineItem.variant.product_id)) {
          total += lineItem.total * lineItem.quantity
        }
      })
    }
    console.log(total)
    return total
  }, [stopProducts, data])

  if (!isWorkTime) {
    return (
      <div className="bg-white flex py-20 text-xl text-yellow font-bold px-10">
        <div>
          {tr('isNotWorkTime')}{' '}
          {locale == 'uz' ? configData.workTimeUz : configData.workTimeRu}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-5 md:mx-0 pt-1 md:pt-0 pb-1">
      {/* Contacts */}
      <div className="w-full bg-white my-5 rounded-2xl">
        <div className="p-10">
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
                {/* <input
                  type="text"
                  {...register('phone', {
                    required: true,
                    pattern: /^\+998\d\d\d\d\d\d\d\d\d$/i,
                  })}
                  className="focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-100 text-gray-400 "
                /> */}
                <Controller
                  render={({ field: { onChange, value } }) => (
                    <Input
                      defaultCountry="UZ"
                      country="UZ"
                      international
                      withCountryCallingCode
                      value={value}
                      className="focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-100 text-gray-400"
                      onChange={(e: any) => onChange(e)}
                    />
                  )}
                  rules={{
                    required: true,
                  }}
                  key="phone"
                  name="phone"
                  control={control}
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
                      {locale == 'uz' ? chosenCity?.name_uz : chosenCity?.name}
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
                      {cities.map((city: City) => (
                        <Menu.Item key={city.id}>
                          <span
                            onClick={() => setActive(city)}
                            className={`block px-4 py-2 text-sm cursor-pointer ${
                              city.id == chosenCity.id
                                ? 'bg-secondary text-white'
                                : 'text-secondary'
                            }`}
                          >
                            {locale == 'uz' ? city.name_uz : city.name}
                          </span>
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
            <div>
              {yandexGeoKey && (
                <YMaps
                  // enterprise
                  query={{
                    apikey: yandexGeoKey,
                  }}
                >
                  <div>
                    <Map
                      state={mapState}
                      onLoad={(ymaps: any) => loadPolygonsToMap(ymaps)}
                      instanceRef={(ref) => (map.current = ref)}
                      width="100%"
                      height={`${window.innerWidth < 768 ? '200px' : '530px'}`}
                      onClick={clickOnMap}
                      modules={[
                        'control.ZoomControl',
                        'control.FullscreenControl',
                        'control.GeolocationControl',
                        'geoQuery',
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
              )}
            </div>
            {addressList && addressList.length > 0 && (
              <div className="mt-3">
                <div className="font-bold text-[18px]">
                  {tr('profile_address')}
                </div>
                <div className="mt-2">
                  <div className="grid grid-cols-3 gap-1 md:gap-2 md:grid-cols-4 max-h-28 overflow-y-auto">
                    {addressList.map((item: Address) => (
                      <div
                        key={item.id}
                        className={`px-2 py-1 truncate rounded-full cursor-pointer relative pr-7 ${
                          addressId == item.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100'
                        }`}
                        onClick={() => selectAddressLocal(item)}
                      >
                        {item.label ? item.label : item.address}
                        <button
                          className="absolute focus:outline-none inset-y-0 outline-none right-2 text-gray-400"
                          onClick={() => deleteAddress(item.id)}
                        >
                          <XIcon className="cursor-pointer h-5 text-gray-400 w-5  hover:text-yellow-light" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="font-bold text-lg">{tr('address')}</div>
                <div className="mt-3 space-y-6">
                  <div className="md:flex justify-between md:w-full space-y-2 md:space-y-0 md:space-x-2 space-x-0">
                    <Downshift
                      onChange={(selection) => setSelectedAddress(selection)}
                      ref={downshiftControl}
                      itemToString={(item) =>
                        item ? item.formatted : watch('address')
                      }
                      // inputValue={locationData?.address || currentAddress}
                      initialInputValue={watch('address') || currentAddress}
                      inputValue={watch('address')}
                      onStateChange={(changes, stateAndHelpers) => {
                        if (changes.hasOwnProperty('inputValue')) {
                          setValue('address', changes.inputValue)
                        }
                      }}
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
                            className="relative md:w-7/12"
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
                            {addresClear && (
                              <button
                                className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                                onClick={() => resetField('address')}
                              >
                                <XIcon className="cursor-pointer h-5 text-gray-400 w-5 hover:text-yellow-light" />
                              </button>
                            )}
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
                    <div className="md:w-2/12">
                      <input
                        type="text"
                        {...register('house', { required: true })}
                        placeholder={tr('house')}
                        className="bg-gray-100 px-8 py-3 rounded-full w-full"
                      />
                      {errors.house && (
                        <div className="text-sm text-center text-red-600">
                          {tr('required')}
                        </div>
                      )}
                    </div>
                    <div className="md:w-3/12">
                      <input
                        type="text"
                        {...register('flat')}
                        placeholder={tr('flat')}
                        className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                      />
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        {...register('label')}
                        placeholder={tr('address_label')}
                        className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:mt-5 flex items-end">
                  <div className="w-6/12">
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
                              <div className="md:flex mt-3 space-y-2 md:space-y-0">
                                <div>
                                  <input
                                    type="text"
                                    {...register('entrance')}
                                    placeholder={tr('entrance')}
                                    className="bg-gray-100 px-8 py-2 rounded-full w-60  outline-none focus:outline-none"
                                  />
                                </div>
                                <div className="md:mx-5">
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
                </div>
                {locationData?.terminalData && (
                  <div className="md:mt-3 flex space-x-2 items-center">
                    <LocationMarkerIcon className="w-5 h-5" />
                    <div className="font-bold">
                      {tr('nearest_filial', {
                        filialName: locationData?.terminalData.name,
                      })}
                    </div>
                  </div>
                )}
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
              {/* <div className="flex mt-3">
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
              </div> */}
            </div>
            {/* <div className="w-full mt-5">
              <input
                type="text"
                {...register('address')}
                placeholder={tr('address')}
                className="bg-gray-100 px-8 rounded-full w-full outline-none focus:outline-none py-2"
              />
            </div> */}
            <div className="mt-5">
              {/* {pickupIndex == 1 && ( */}
              {/* <>
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
                </> */}
              {/* )} */}
              {/* {pickupIndex == 2 && ( */}
              <div className="gap-5 grid md:grid-cols-2">
                {pickupPoints.map((point) => (
                  <div
                    key={point.id}
                    className={`border flex items-start p-3 rounded-[15px] cursor-pointer ${
                      activePoint && activePoint == point.id
                        ? 'border-yellow'
                        : 'border-gray-400'
                    } ${!point.isWorking ? 'opacity-30' : ''}`}
                    onClick={() => choosePickupPoint(point)}
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
                      <div className="font-bold">
                        {locale == 'uz' ? point.name_uz : point.name}
                      </div>
                      {point.desc && (
                        <div className="text-gray-400 text-sm">
                          {tr('address')}:{' '}
                          {locale == 'ru' ? point.desc : point.desc_uz}
                        </div>
                      )}
                      {point.near && (
                        <div className="text-gray-400 text-sm">
                          {tr('nearLabel')}:{' '}
                          {locale == 'ru' ? point.near : point.near_uz}
                        </div>
                      )}
                      <div className="font-bold text-gray-700">
                        {tr('terminalWorkTime', {
                          workTimeStart: point.workTimeStart,
                          workTimeEnd: point.workTimeEnd,
                        })}
                      </div>
                      {point.services && (
                        <div className="flex py-2 space-x-3">
                          {point.services.split(',').map((service: string) => (
                            <span key={service}>
                              <img
                                src={`/assets/services/${service}.webp`}
                                alt=""
                              />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* )} */}
            </div>
          </div>
        )}
      </div>
      {/* time of delivery */}
      <div className="w-full bg-white mb-5 rounded-2xl p-10">
        <div className="text-lg mb-5 font-bold">
          {tr('order_time_of_delivery')}
        </div>
        <div className="flex  md:block space-x-5">
          <button
            className={`${
              deliveryActive == 'now'
                ? 'bg-yellow text-white'
                : 'text-gray-400 bg-gray-100'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44`}
            onClick={() => setDeliverySchedule('now')}
          >
            {tr('hurry_up')}
          </button>
          <button
            className={`${
              deliveryActive == 'later'
                ? 'bg-yellow text-white'
                : 'text-gray-400 bg-gray-100'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 md:ml-5`}
            onClick={() => setDeliverySchedule('later')}
          >
            {tr('later')}
          </button>
        </div>
        {deliveryActive == 'later' && (
          <div className="mt-8 flex">
            {/* <Controller
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
              key="delivery_day"
              name="delivery_day"
              control={control}
            /> */}
            <Controller
              render={({ field: { onChange } }) => (
                <Select
                  items={deliveryTimeOptions}
                  placeholder={tr('time')}
                  onChange={(e: any) => onChange(e)}
                />
              )}
              rules={{
                required: true,
              }}
              key="delivery_time"
              name="delivery_time"
              control={control}
            />
          </div>
        )}
      </div>
      {/* pay */}
      <div className="w-full bg-white mb-5 rounded-2xl p-10 relative">
        {!locationData?.terminal_id && (
          <div className="absolute h-full bg-opacity-60 bg-gray-100 z-20 items-center flex justify-around left-0 bottom-0 right-0">
            <div className="text-yellow font-bold text-2xl text-center">
              {tr('no_address_no_restaurant')}
            </div>
          </div>
        )}
        <div className="text-lg mb-5 font-bold">{tr('order_pay')}</div>
        <div className="flex md:block">
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
          <button
            className={`${
              openTab !== 2
                ? 'text-gray-400 bg-gray-100'
                : 'bg-yellow text-white'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 ml-5`}
            onClick={() => setOpenTab(2)}
          >
            {tr('payment_type_card')}
          </button>
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
            {...register('change')}
            min="10000"
            step="1000"
            className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm md:w-80 w-full bg-gray-100 text-gray-400 mt-8"
            placeholder={tr('change')}
          />
        </div>
        <div className={openTab === 2 ? 'block' : 'hidden'} id="link2">
          <div className="grid grid-cols-2 w-60 pt-8 items-center">
            <label
              className={`flex justify-around items-center w-24 h-24 p-3 rounded-2xl ${
                payType == 'uzcard' ? 'border-yellow' : 'border-gray-200'
              } border cursor-pointer`}
            >
              <img src="/assets/uzcard.png" />
              <input
                type="radio"
                defaultValue="uzcard"
                checked={payType === 'uzcard'}
                onChange={onValueChange}
                className="hidden"
              />
            </label>
            {/* <label
              className={`flex justify-around items-center w-24 h-24 p-3 rounded-2xl ${
                payType == 'visa' ? 'border-yellow' : 'border-gray-200'
              } border cursor-pointer`}
            >
              <img src="/assets/visa.png" />
              <input
                type="radio"
                defaultValue="visa"
                onChange={onValueChange}
                checked={payType === 'visa'}
                className="hidden"
              />
            </label> */}
            {/* <label
              className={`flex justify-around items-center w-24 h-24 p-3 rounded-2xl ${
                payType == 'humo' ? 'border-yellow' : 'border-gray-200'
              } border cursor-pointer`}
            >
              <img src="/assets/humo.png" />
              <input
                type="radio"
                defaultValue="humo"
                onChange={onValueChange}
                checked={payType === 'humo'}
                className="hidden"
              />
            </label> */}
            {/* <label
              className={`flex justify-around items-center w-24 h-24 p-3 rounded-2xl ${
                payType == 'mastercard' ? 'border-yellow' : 'border-gray-200'
              } border cursor-pointer`}
            >
              <img src="/assets/mastercard.png" />
              <input
                type="radio"
                defaultValue="mastercard"
                onChange={onValueChange}
                checked={payType === 'mastercard'}
                className="hidden"
              />
            </label> */}
          </div>
          {/* <div className="md:w-[460px] pt-10">
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
          </div> */}
        </div>
        <div className={openTab === 3 ? 'block' : 'hidden'} id="link3">
          <div className="pt-8 items-center flex gap-1">
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
                    <img src={`/assets/${payment}.svg`} />
                    <input
                      type="radio"
                      {...register('pay_type', { required: openTab === 3 })}
                      defaultValue={payment}
                      checked={payType === payment}
                      onChange={onValueChange}
                      className="hidden"
                    />
                  </label>
                ))}
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
                  <div className="md:flex mt-3 md:w-96 h-28">
                    <div className="w-full">
                      <textarea
                        {...register('notes')}
                        className="md:w-96 w-full h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none"
                        placeholder={tr(
                          'only_the_courier_will_see_your_comment'
                        )}
                      ></textarea>
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
      {/* order list */}
      <div className="w-full bg-white mb-5 rounded-2xl p-10">
        <div className="text-lg mb-5 font-bold">{tr('order_order_list')}</div>
        {!isEmpty &&
          data &&
          data?.lineItems.map((lineItem: any) => (
            <div
              className={`flex justify-between items-center border-b py-2`}
              key={lineItem.id}
            >
              {lineItem.child &&
              lineItem.child.length &&
              lineItem.child[0].variant?.product?.id !=
                lineItem?.variant?.product?.box_id ? (
                <div
                  className={`${
                    isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                  } h-11 w-11 flex relative`}
                >
                  <div className="w-5 relative overflow-hidden">
                    <div>
                      <Image
                        src={
                          lineItem?.variant?.product?.assets?.length
                            ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                            : '/no_photo.svg'
                        }
                        width="40"
                        height="40"
                        layout="fixed"
                        className="absolute rounded-full"
                      />
                    </div>
                  </div>
                  <div className="w-5 relative overflow-hidden">
                    <div className="absolute right-0">
                      <Image
                        src={
                          lineItem?.child[0].variant?.product?.assets?.length
                            ? `${webAddress}/storage/${lineItem?.child[0].variant?.product?.assets[0]?.location}/${lineItem?.child[0].variant?.product?.assets[0]?.filename}`
                            : '/no_photo.svg'
                        }
                        width="40"
                        height="40"
                        layout="fixed"
                        className="rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`${
                    isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                  } flex items-center`}
                >
                  <Image
                    src={
                      lineItem?.variant?.product?.assets?.length
                        ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                        : '/no_photo.svg'
                    }
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              )}
              <div
                className={`${
                  isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                }font-bold md:text-xl text-base ml-4`}
              >
                {lineItem.child && lineItem.child.length > 1 ? (
                  `${
                    lineItem?.variant?.product?.attribute_data?.name[
                      channelName
                    ][locale || 'ru']
                  } + ${lineItem?.child
                    .filter(
                      (v: any) =>
                        lineItem?.variant?.product?.box_id !=
                        v?.variant?.product?.id
                    )
                    .map(
                      (v: any) =>
                        v?.variant?.product?.attribute_data?.name[channelName][
                          locale || 'ru'
                        ]
                    )
                    .join(' + ')}`
                ) : (
                  <div
                    className={
                      isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                    }
                  >
                    {isProductInStop.includes(lineItem.id)
                      ? tr('stop_product')
                      : lineItem?.variant?.product?.attribute_data?.name[
                          channelName
                        ][locale || 'ru']}
                  </div>
                )}
                {lineItem.bonus_id && (
                  <span className="text-yellow">({tr('bonus')})</span>
                )}
                {lineItem.sale_id && (
                  <span className="text-yellow">({tr('sale_label')})</span>
                )}
                {lineItem.modifiers &&
                  lineItem.modifiers
                    .filter((mod: any) => mod.price > 0)
                    .map((mod: any) => (
                      <div
                        className="placeholder-blackbg-yellow rounded-full px-2 py-1 ml-2 text-xs text-white"
                        key={mod.id}
                      >
                        {locale == 'uz' ? mod.name_uz : mod.name}
                      </div>
                    ))}
              </div>
              {/* {isProductInStop.includes(lineItem.id) && (
                <div className="absolute text-center left-0 right-0 md:text-yellow  text-opacity-100 text-2xl w-40 md:w-max m-auto leading-4">
                  {tr('stop_product')}
                </div>
              )} */}

              <div
                className={`${
                  isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                } md:text-xl text-base`}
              >
                {(lineItem.total > 0 ? lineItem.quantity + ' X ' : '') +
                  currency(lineItem.total * lineItem.quantity, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
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
              {currency(totalPrice, {
                pattern: '# !',
                separator: ' ',
                decimal: '.',
                symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                precision: 0,
              }).format()}
            </div>
          </div>
        )}
      </div>
      <div className="w-full bg-white mb-5 rounded-2xl p-10">
        <div className="md:flex">
          {!!user.user.sms_sub != true ||
            (!!user.user.email_sub != true && (
              <div className="mr-8 text-gray-400">{tr('agree_to_send')}</div>
            ))}
          {!!user.user.sms_sub != true && (
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
          )}
          {!!user.user.email_sub != true && authEmail && (
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
          )}
        </div>
        <div className="mt-5 text-gray-400 text-sm md:flex border-b pb-8">
          {tr('processing_of_your_personal_data')}
          <a
            href="/privacy"
            onClick={showPrivacy}
            className="text-yellow block md:mx-1"
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
                    <div
                      className="align-middle bg-white inline-block max-w-4xl overflow-hidden p-10 rounded-2xl shadow-xl text-left transform transition-all w-full"
                      dangerouslySetInnerHTML={{ __html: tr('privacy_text') }}
                    ></div>
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
        <div className="md:flex justify-between mt-8 space-y-2 md:space-y-0">
          <button
            className="md:text-xl text-gray-400 bg-gray-200 flex h-12 items-center justify-between px-12 rounded-full md:w-80 w-full"
            onClick={(e) => {
              e.preventDefault()
              router.push(`/${activeCity.slug}/cart/`)
            }}
          >
            <img src="/left.png" /> {tr('back_to_basket')}
          </button>
          <button
            className={`md:text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full md:w-80 w-full ${
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
                {tr('checkout')} <img src="/right.png" />
              </>
            )}
          </button>
        </div>
      </div>
      <Transition appear show={isPhoneConfirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => {}}
          initialFocus={authButtonRef}
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
                <div className="md:inline-flex my-8 items-start">
                  <div className="align-middle bg-white inline-block overflow-hidden md:px-40 px-6 py-10 rounded-2xl shadow-xl text-center transform transition-all max-w-2xl">
                    <Dialog.Title as="h3" className="leading-6 text-3xl">
                      $
                      {locale == 'uz'
                        ? 'Buyurtmani tasdiqlash'
                        : 'Подтверждение заказа'}
                    </Dialog.Title>
                    <Dialog.Description>
                      $
                      {locale == 'uz'
                        ? 'SMS-dan kodni kiriting'
                        : 'Укажите код из смс'}
                    </Dialog.Description>
                    <div>
                      <form onSubmit={handlePasswordSubmit(saveOrder)}>
                        <div className="mt-10">
                          <label className="text-sm text-gray-400 mb-2 block">
                            ${locale == 'uz' ? 'SMS-dan kod' : 'Код из смс'}
                          </label>
                          <OtpInput
                            value={otpCode}
                            onChange={handleOtpChange}
                            inputStyle={`${styles.digitField} border border-yellow w-16 rounded-3xl h-12 outline-none focus:outline-none text-center`}
                            isInputNum={true}
                            containerStyle="grid grid-cols-4 gap-1.5 justify-center"
                            numInputs={4}
                          />
                          {otpShowCode > 0 ? (
                            <div className="text-xs text-yellow mt-3">
                              {otpTimerText}
                            </div>
                          ) : (
                            <button
                              className="text-xs text-yellow mt-3 outline-none focus:outline-none border-b border-yellow pb-0.5"
                              onClick={(e) => getNewCode(e)}
                            >
                              $
                              {locale == 'uz'
                                ? 'Kodni qayta olish'
                                : 'Получить код заново'}
                            </button>
                          )}
                        </div>
                        <div className="mt-10">
                          <button
                            className={`py-3 px-20 text-white font-bold text-xl text-center rounded-full w-full outline-none focus:outline-none ${
                              otpCode.length >= 4 ? 'bg-yellow' : 'bg-gray-400'
                            }`}
                            disabled={otpCode.length < 4}
                            ref={authButtonRef}
                          >
                            {passwordFormState.isSubmitting ? (
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
                            ) : locale == 'uz' ? (
                              'Tasdiqlash'
                            ) : (
                              'Подтвердить'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default memo(Orders)
