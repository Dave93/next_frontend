'use client'

import { XIcon } from '@heroicons/react/outline'
import getAssetUrl from '@utils/getAssetUrl'
import { useForm, Controller } from 'react-hook-form'
import { useUI } from '@components/ui/context'
import { useUserStore } from '../../lib/stores/user-store'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'
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
import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/solid'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
} from 'react-yandex-maps'
// next/image removed from this file — every image here is a small,
// fixed-size icon that doesn't need the optimizer pipeline.
import { useCart } from '@framework/cart'
import currency from 'currency.js'
import axios from 'axios'
import { debounce } from 'lodash'
import Downshift from 'downshift'
import Select from '@components_new/utils/Select'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { useRouter, usePathname } from '../../i18n/navigation'
import { useLocale } from 'next-intl'
import OtpInput from 'react-otp-input'
import styles from './Orders.module.css'
import { DateTime } from 'luxon'
import Input from '../common/LazyPhoneInput'
import { City } from '@commerce/types/cities'
import { chunk, sortBy } from 'lodash'
import getAddressList from '@lib/load_addreses'
import { Address } from '@commerce/types/address'
import Hashids from 'hashids'
import AddressSelection, {
  AddressSelectionMobileApp as AddressSelectionMobile,
} from './AddressSelectionApp'
import { trackOrderPlaced, trackOrderFailed } from '@lib/posthog-events'

let webAddress = process.env.NEXT_PUBLIC_API_URL
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
  pay_type: string | null | undefined
  delivery_schedule: string
  label?: string
  addressId: number | null
  additional_phone: string
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

// const errors: Errors = {
//   name_field_is_required:
//     'Мы Вас не нашли в нашей системе. Просьба указать своё имя.',
//   opt_code_is_incorrect: 'Введённый код неверный или срок кода истёк',
// }

let otpTimerRef: NodeJS.Timeout

type OrdersProps = {
  channelName: any
  isMobile?: boolean
}

const OrdersApp: FC<OrdersProps> = ({ channelName, isMobile = false }) => {
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
  const locale = useLocale()
  const translations: Record<string, string> = {
    today: 'Сегодня',
    tomorrow: 'Завтра',
    point_delivery_not_available: 'Доставка по данному адресу недоступна',
    terminal_is_not_working: 'Ресторан не работает',
    no_address_specified: 'Не указан адрес',
    restaurant_not_found: 'Ресторан не найден',
    nearest_terminal_is_closed: 'Ближайший ресторан закрыт',
    location_tabs_incorrect_data: 'Укажите адрес доставки',
    payment_system_not_selected: 'Не выбран способ оплаты',
    delivery_time_not_specified: 'Не указано время доставки',
    isNotWorkTime: 'Мы не работаем.',
    order_your_contacts: 'Ваши контакты',
    personal_data_name: 'Имя',
    required: 'Обязательное поле',
    personal_phone: 'Телефон',
    personal_email: 'Email',
    additional_phone: 'Дополнительный телефон',
    search_for_the_nearest_restaurant: 'Найти ближайший ресторан',
    on_the_map: 'На карте',
    list: 'Список',
    address: 'Адрес',
    nearLabel: 'Рядом',
    order_time_of_delivery: 'Время доставки',
    hurry_up: 'Как можно скорее',
    later: 'Позже',
    select_date: 'Выберите дату',
    time: 'Время',
    no_address_no_restaurant: 'Укажите адрес для выбора ресторана',
    order_pay: 'Оплата',
    in_cash: 'Наличными',
    payment_type_card: 'Картой',
    online: 'Онлайн',
    change: 'Сдача',
    holder_name: 'Имя держателя',
    insufficient_funds: 'Недостаточно средств',
    deposit_label: 'Депозит',
    comment_on_the_order: 'Комментарий к заказу',
    only_the_courier_will_see_your_comment: 'Комментарий увидит только курьер',
    order_order_list: 'Состав заказа',
    stop_product: 'Нет в наличии',
    bonus: 'Бонус',
    sale_label: 'Акция',
    basket_order_price: 'Сумма заказа',
    cutlery_and_napkins: 'Приборы и салфетки',
    no: 'Нет',
    yes: 'Да',
    agree_to_send: 'Согласен на рассылку',
    mailing: 'рассылка',
    processing_of_your_personal_data: 'Обработка персональных данных',
    terms_of_use: 'Условия использования',
    privacy_text: '',
    back_to_basket: 'Вернуться в корзину',
    checkout: 'Оформить заказ',
    terminalWorkTime: 'Время работы',
  }
  const tr = (key: string, params?: Record<string, any>) => {
    let text = translations[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }
  // Reads via Zustand selectors, writes via legacy reducer (dual-write
  // mirrors back). selectAddress / setStopProducts have no Zustand
  // equivalent yet — kept on legacy.
  const user = useUserStore((s) => s.user) as any
  const locationData = useLocationStore((s) => s.locationData) as any
  const cities = useLocationStore((s) => s.cities) as any
  const activeCity = useLocationStore((s) => s.activeCity) as any
  const addressId = useLocationStore((s) => s.addressId)
  const addressList = useLocationStore((s) => s.addressList) as any
  const openSignInModal = useUIStore((s) => s.openSignInModal)
  const {
    stopProducts,
    setUserData,
    setLocationData,
    setActiveCity,
    setAddressId,
    setAddressList,
    selectAddress,
    setStopProducts,
  } = useUI() as any
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }

  const router = useRouter()
  const pathname = usePathname()
  const query = {} as Record<string, any>
  const downshiftControl = useRef<any>(null)
  const map = useRef<any>(null)
  const [ymaps, setYmaps] = useState<any>(null)
  const [cutlery, setCutlery] = useState('Y')
  const objects = useRef<any>(null)
  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
    locationData,
  })
  const [deposit, setDeposit] = useState(0)
  let currentAddress = ''
  if (activeCity?.active) {
    if (locale == 'ru') {
      currentAddress = 'Узбекистан, ' + activeCity?.name + ','
    } else if (locale == 'uz') {
      currentAddress = "O'zbekiston, " + activeCity?.name_uz + ','
    } else if (locale == 'en') {
      currentAddress = 'Uzbekistan, ' + activeCity?.name_en + ','
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
    formState: { errors, isValid },
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
      additional_phone: '',
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
  const additionalPhone = watch('additional_phone')

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }
  //Orders
  const generateDateOptions = () => {
    const dateOptions = [] as SelectItem[]
    let currentDate = DateTime.now()

    // Generate options for next 7 days
    for (let i = 0; i < 7; i++) {
      const date = currentDate.plus({ days: i })
      const formattedDate = date.toFormat('dd.MM.yyyy')
      const label =
        i === 0
          ? `${tr('today')} (${formattedDate})`
          : i === 1
          ? `${tr('tomorrow')} (${formattedDate})`
          : formattedDate

      dateOptions.push({
        value: date.toFormat('yyyy-MM-dd'),
        label: label,
      })
    }

    return dateOptions
  }

  const dateOptions = useMemo(() => generateDateOptions(), [locale])

  const [selectedDate, setSelectedDate] = useState(DateTime.now())
  const [timeOptions, setTimeOptions] = useState<SelectItem[]>([])

  const generateTimeOptions = (selectedDate: DateTime) => {
    const timeOptions = [] as SelectItem[]

    // Don't show past times
    if (selectedDate < DateTime.now().startOf('day')) {
      return [] // Return empty options for past dates
    }

    let startTime: DateTime
    const now = DateTime.now()

    // If selected date is today, start from current time + 80 minutes
    // Otherwise start from restaurant opening time (11:00)
    if (selectedDate.hasSame(now, 'day')) {
      startTime = now.plus({ minutes: 80 })
    } else {
      startTime = selectedDate.set({ hour: 11, minute: 0 }) // Restaurant opens at 11:00
    }

    // Round up to nearest 10 minutes
    startTime = startTime.set({
      minute: Math.ceil(startTime.minute / 10) * 10,
    })

    // Generate time slots until 3 AM next day
    const endTime = selectedDate.plus({ days: 1 }).set({ hour: 3, minute: 0 })

    while (startTime < endTime) {
      const slotEnd = startTime.plus({ minutes: 20 })

      const val = `${zeroPad(startTime.hour, 2)}:${zeroPad(
        startTime.minute,
        2
      )} - ${zeroPad(slotEnd.hour, 2)}:${zeroPad(slotEnd.minute, 2)}`

      timeOptions.push({
        value: val,
        label: val,
      })

      startTime = startTime.plus({ minutes: 40 })
      startTime = startTime.set({
        minute: Math.ceil(startTime.minute / 10) * 10,
      })
    }

    return timeOptions
  }

  useEffect(() => {
    const timeOptionsLocal = generateTimeOptions(selectedDate)
    setTimeOptions(timeOptionsLocal)
  }, [selectedDate])

  const [tabIndex, setTabIndex] = useState(
    locationData?.deliveryType || 'deliver'
  )

  useEffect(() => {
    if (locationData?.deliveryType) {
      setTabIndex(locationData.deliveryType)
    }
  }, [locationData?.deliveryType])

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
    (locationData?.location && locationData.location.length
      ? 17
      : activeCity?.map_zoom || 10) as number
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

  const checkDeposit = async () => {
    await setCredentials()
    const otpToken = Cookies.get('opt_token')
    let { data } = await axios.get(
      `${webAddress}/api/organizations/check_deposit`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otpToken}`,
        },
        withCredentials: true,
      }
    )
    if (data.success) {
      setDeposit(data.data)
    }
  }

  useEffect(() => {
    stopList()
    checkDeposit()
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
        activeCity?.bounds
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
    } else if (locale == 'ru') {
      setValue('address', 'Узбекистан, ' + city.name)
      downshiftControl?.current?.reset({
        inputValue: 'Узбекистан, ' + city.name + ',',
      })
    } else if (locale == 'en') {
      setValue('address', 'Uzbekistan, ' + city.name_en)
      downshiftControl?.current?.reset({
        inputValue: 'Uzbekistan, ' + city.name_en + ',',
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
      deliveryType: tabIndex,
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
      toast.warning(tr('point_delivery_not_available'))
      return
    } else {
      let pickedCity = cities.find(
        (city: City) => city.slug == polygon.properties._data.slug
      )

      if (pickedCity.id != activeCity?.id) {
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
      deliveryType: tabIndex,
      location: coords,
      address: data.data.formatted,
      house,
      terminal_id: terminalData.terminal_id,
      terminalData: terminalData.terminalData,
    })
  }

  const cutleryHandler = (e: any) => {
    setCutlery(e.target.value)
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

  const setDepositPay = () => {
    if (deposit >= totalPrice) {
      // setValue('pay_type', 'deposit', { shouldValidate: true })
      // console.log(deposit)
      // trigger('pay_type')
      setPayType('deposit')
    }
  }

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
      `${webAddress}/api/terminals/pickup?city_id=${activeCity?.id}`
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
      toast.warning(tr('terminal_is_not_working'))
      return
    }
    setActivePoint(point.id)
    let terminalData = pickupPoints.find((pickup: any) => pickup.id == point.id)
    setLocationData({
      ...locationData,
      deliveryType: tabIndex,
      terminal_id: point.id,
      terminalData,
    })
  }

  const searchTerminal = async (
    locationData: any = {},
    returnResult: boolean = false
  ) => {
    if (!locationData || !locationData.location) {
      toast.warning(tr('no_address_specified'))
      // if returnResult is true, return object else return setLocationData
      return returnResult
        ? {
            terminal_id: undefined,
            terminalData: undefined,
          }
        : setLocationData({
            ...locationData,
            deliveryType: tabIndex,
            terminal_id: undefined,
            terminalData: undefined,
          })
    }

    const { data: terminalsData } = await axios.get(
      `${webAddress}/api/terminals/find_nearest?lat=${locationData.location[0]}&lon=${locationData.location[1]}`
    )

    if (terminalsData.data && !terminalsData.data.items.length) {
      toast.warning(
        terminalsData.data.message
          ? terminalsData.data.message
          : tr('restaurant_not_found')
      )

      // if returnResult is true, return object else return setLocationData
      return returnResult
        ? {
            terminal_id: undefined,
            terminalData: undefined,
          }
        : setLocationData({
            ...locationData,
            deliveryType: tabIndex,
            terminal_id: undefined,
            terminalData: undefined,
          })
    } else {
      let currentTerminal = terminalsData.data.items[0]
      if (!currentTerminal.isWorking) {
        toast.warning(tr('nearest_terminal_is_closed'))
        return returnResult
          ? {
              terminal_id: undefined,
              terminalData: undefined,
            }
          : setLocationData({
              ...locationData,
              deliveryType: tabIndex,
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
            deliveryType: tabIndex,
            terminal_id: terminalsData.data.items[0].id,
            terminalData: terminalsData.data.items[0],
          })
    }
  }

  // Auto-pick the nearest restaurant the moment the user drops a pin or
  // selects an autocomplete suggestion in the inline picker. Without this,
  // the payment selector stays disabled even after the address is filled in.
  // Keyed on the coordinate string so we don't loop on every render.
  const lastSearchedCoordsRef = useRef<string | null>(null)
  useEffect(() => {
    if (tabIndex !== 'deliver') return
    const coords = locationData?.location
    if (!coords || !coords[0] || !coords[1]) return
    const key = `${coords[0]},${coords[1]}`
    if (lastSearchedCoordsRef.current === key) return
    if (locationData?.terminal_id) {
      lastSearchedCoordsRef.current = key
      return
    }
    lastSearchedCoordsRef.current = key
    searchTerminal(locationData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationData?.location, tabIndex])

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
    let sourceType = 'web'
    if (window.innerWidth < 768) {
      sourceType = 'mobile_web'
    }
    try {
      const { data } = await axios.post(`${webAddress}/api/orders/prepare`, {
        formData: {
          ...locationData,
          ...getValues(),
          pay_type: payType,
          sms_sub: sms,
          email_sub: newsletter,
          sourceType,
          need_napkins: cutlery == 'Y',
        },
        basket_id: cartId,
      })
      if (!data.success) {
        toast.error(data.message)
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
      const errMsg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        'Не удалось отправить код'
      setIsSavingOrder(false)
      toast.error(String(errMsg))
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
      toast.warning(tr('location_tabs_incorrect_data'))
      return
    } else if (
      locationData.deliveryType === 'deliver' &&
      (!locationData.location || !locationData.location.length)
    ) {
      toast.warning(tr('location_tabs_incorrect_data'))
      return
    }

    setIsSavingOrder(true)
    await setCredentials()
    const otpToken = Cookies.get('opt_token')

    // if (!payType) {
    //   toast.error(tr('payment_system_not_selected'), {
    //     position: toast.POSITION.BOTTOM_RIGHT,
    //     hideProgressBar: true,
    //   })
    //   return
    // }
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
            need_napkins: cutlery == 'Y',
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

      // PostHog: order_placed
      trackOrderPlaced({
        order_id: data.order.id,
        order_total: data.order.order_total / 100,
        items_count: data.order.items_count || 0,
        pay_type: payType,
        delivery_type: locationData?.deliveryType,
        city: activeCity?.slug,
        source_type: sourceType,
        has_discount: (data.order.discount_total || 0) > 0,
      })

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
      router.push(`/${activeCity?.slug}/order/${data.order.id}`)
      setTimeout(() => {
        ;(window.b24order = window.b24order || []).push({
          id: orderHashids.decode(data.order.id)[0],
          sum: data.order?.order_total / 100,
        })
      }, 500)
    } catch (e: any) {
      const errMsg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        'Ошибка оформления заказа'
      setIsSavingOrder(false)
      toast.error(String(errMsg))
      trackOrderFailed({ error_message: errMsg })
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
    toast.error(tr('payment_system_not_selected'))
  }

  if (errors.delivery_day || errors.delivery_time) {
    toast.error(tr('delivery_time_not_specified'))
  }

  const selectAddressLocal = async (address: Address) => {
    if (address.id == addressId) {
      setAddressId(null)
    } else {
      if (address.lat && address.lon) {
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
          total += lineItem.total
        }
      })
    }
    return total
  }, [stopProducts, data])

  if (!isWorkTime) {
    return (
      <div className="bg-white flex py-20 text-xl text-yellow font-bold px-10">
        <div>
          {tr('isNotWorkTime')}{' '}
          {locale == 'uz'
            ? configData.workTimeUz
            : locale == 'ru '
            ? configData.workTimeRu
            : locale == 'en'
            ? configData.workTimeEn
            : ''}
        </div>
      </div>
    )
  }

  const addNewAddress = async () => {
    const newFields: any = {
      ...getValues(),
    }
    newFields['address'] = null
    newFields['flat'] = null
    newFields['house'] = null
    newFields['entrance'] = null
    newFields['door_code'] = null
    newFields['label'] = null
    newFields['addressId'] = null
    setAddressId(null)
    selectAddress({
      locationData: {
        location: [],
        terminal_id: undefined,
        terminalData: undefined,
      },
      addressId: null,
    })
    reset(newFields)
    downshiftControl?.current?.reset({ inputValue: '' })
    setLocationData({
      ...locationData,
      deliveryType: tabIndex,
      location: [],
      address: '',
      terminal_id: undefined,
      terminalData: undefined,
    })
  }

  return (
    <div className="orders-root mx-5 md:mx-0 pt-1 md:pt-0 pb-1">
      {/* Contacts — always visible. Even logged-in users should be able
          to verify / edit name, phone, and email before placing the order
          (Baymard's "always show editable contact" rule). */}
      <div className="w-full bg-white my-5 rounded-2xl">
        <div className="text-lg mb-5 font-bold">
          {tr('order_your_contacts')}
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-2 md:grid-cols-4"
        >
          <div className="col-span-2">
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
          <div className="col-span-2">
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
          <div className="col-span-2">
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
          <div className="col-span-2">
            <div className="text-sm text-gray-400 mb-2 block">
              {tr('additional_phone')}
            </div>
            <div className="relative">
              <Input
                defaultCountry="UZ"
                country="UZ"
                international
                withCountryCallingCode
                value={additionalPhone}
                className="focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-100 text-gray-400 "
                onChange={(e: any) => {
                  setValue('additional_phone', e)
                }}
              />
              {additionalPhone && (
                <button
                  className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                  onClick={() => resetField('additional_phone')}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      {/* Address Selection */}
      <div className="my-5 order-delivery-section">
        {isMobile ? (
          <AddressSelectionMobile
            register={register}
            setValue={setValue}
            locationData={locationData}
            setLocationData={setLocationData}
            cities={cities}
            activeCity={activeCity}
            setActiveCity={setActiveCity}
            addressList={addressList}
            addressId={addressId}
            onSelectAddress={selectAddressLocal}
            onAddNewAddress={addNewAddress}
            yandexGeoKey={yandexGeoKey}
            configData={configData}
            tabIndex={tabIndex}
            onChangeTab={changeTabIndex}
            searchTerminal={searchTerminal}
            downshiftRef={downshiftControl}
            mapRef={map}
          />
        ) : (
          <AddressSelection
            register={register}
            setValue={setValue}
            locationData={locationData}
            setLocationData={setLocationData}
            cities={cities}
            activeCity={activeCity}
            setActiveCity={setActiveCity}
            addressList={addressList}
            addressId={addressId}
            onSelectAddress={selectAddressLocal}
            onAddNewAddress={addNewAddress}
            yandexGeoKey={yandexGeoKey}
            configData={configData}
            tabIndex={tabIndex}
            onChangeTab={changeTabIndex}
            searchTerminal={searchTerminal}
            downshiftRef={downshiftControl}
            mapRef={map}
          />
        )}
        {/* Legacy "Найти ближайший ресторан" pickup grid removed — terminal
            selection now lives inside AddressSelectionApp's LocationPickerCore. */}
      </div>
      {/* time of delivery - hide for pickup */}
      <div
        className={`w-full bg-white my-5 rounded-2xl order-delivery-time ${
          tabIndex === 'pickup' ? 'hidden' : ''
        }`}
      >
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
          <div className="mt-8 flex space-x-4">
            <Controller
              render={({ field: { onChange } }) => (
                <Select
                  items={dateOptions}
                  placeholder={tr('select_date')}
                  onChange={(e: any) => {
                    onChange(e)
                    const selectedDateTime = DateTime.fromFormat(
                      e,
                      'yyyy-MM-dd'
                    )
                    setSelectedDate(selectedDateTime)
                  }}
                />
              )}
              rules={{
                required: true,
              }}
              key="delivery_day"
              name="delivery_day"
              control={control}
            />
            <Controller
              render={({ field: { onChange } }) => (
                <Select
                  items={timeOptions}
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
      <div className="w-full bg-white my-5 rounded-2xl relative">
        {!locationData?.terminal_id && (
          <div className="absolute h-full bg-opacity-60 bg-gray-100 z-20 items-center flex justify-around left-0 bottom-0 right-0">
            <div className="text-yellow font-bold text-2xl text-center">
              {tr('no_address_no_restaurant')}
            </div>
          </div>
        )}
        <div className="text-lg mb-5 font-bold">{tr('order_pay')}</div>
        {/* Flat payment grid — every method (cash + each enabled online
            provider + deposit) is a single equal-sized card. No tabs,
            no two-step pick. Per Baymard 2025 checkout research, an "all
            methods visible" pattern lifts conversion versus tab-gated
            ones because the user immediately sees the option they want. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Cash card. Icon: a stylised wallet/banknote (no dollar sign,
              no currency symbol — keeps it neutral so customers don't
              think they're being charged in USD). */}
          <button
            type="button"
            onClick={() => {
              setOpenTab(1)
              if (payType !== 'cash') setPayType('cash')
            }}
            className={`flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl border transition ${
              openTab === 1
                ? 'border-yellow bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={openTab === 1 ? 'text-yellow' : 'text-gray-500'}
            >
              <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
              <circle cx="12" cy="12" r="2.5" />
              <path d="M6 9.5h.01M18 14.5h.01" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              {tr('in_cash')}
            </span>
          </button>

          {/* Online providers — only show those enabled for the selected
              terminal, just like the legacy openTab=3 grid. */}
          {locationData?.terminal_id &&
            paymentTypes
              .filter(
                (payment: string) =>
                  !!locationData?.terminalData?.[`${payment}_active`]
              )
              .map((payment: string) => {
                const active = openTab === 3 && payType === payment
                return (
                  <label
                    key={payment}
                    className={`flex items-center justify-center aspect-square rounded-2xl border cursor-pointer transition ${
                      active
                        ? 'border-yellow bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => setOpenTab(3)}
                  >
                    <img
                      src={`/assets/${payment}.svg`}
                      alt={payment}
                      width={64}
                      height={42}
                    />
                    <input
                      type="radio"
                      {...register('pay_type', { required: openTab === 3 })}
                      defaultValue={payment}
                      checked={payType === payment}
                      onChange={onValueChange}
                      className="hidden"
                    />
                  </label>
                )
              })}

          {/* Deposit card — disabled visually when balance is insufficient. */}
          {deposit > 0 && (
            <div
              className={`relative flex flex-col items-center justify-center gap-1 aspect-square rounded-2xl border transition ${
                payType === 'deposit'
                  ? 'border-yellow bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${
                deposit < totalPrice ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={(e) => {
                if (deposit < totalPrice) {
                  e.preventDefault()
                  return
                }
                setOpenTab(3)
                setDepositPay()
              }}
            >
              {deposit < totalPrice && (
                <div className="absolute inset-0 rounded-2xl bg-gray-500/30 flex items-start justify-center pt-1.5 text-[11px] font-bold text-yellow">
                  {tr('insufficient_funds')}
                </div>
              )}
              <input
                type="radio"
                {...register('pay_type', { required: openTab === 3 })}
                defaultValue="deposit"
                checked={payType === 'deposit'}
                onChange={onValueChange}
                className="hidden"
              />
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  payType === 'deposit' ? 'text-yellow' : 'text-gray-500'
                }
              >
                <path d="M21 12a9 9 0 1 1-9-9" />
                <path d="M21 4v5h-5" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              <div className="text-xs font-semibold text-gray-700">
                {tr('deposit_label')}
              </div>
              <div className="text-xs text-gray-500">
                {Intl.NumberFormat('ru').format(deposit)}
              </div>
            </div>
          )}
        </div>

        {/* Cash-only secondary input: "Change with" appears under the
            grid when Наличными is selected. */}
        {openTab === 1 && (
          <input
            type="number"
            {...register('change')}
            min="10000"
            step="1000"
            className="focus:outline-none outline-none px-6 py-3 rounded-full text-sm md:w-80 w-full bg-gray-100 text-gray-400 mt-5"
            placeholder={tr('change')}
          />
        )}
        {/* <div className={openTab === 2 ? 'block' : 'hidden'} id="link2"> */}
        {/* <div className="grid grid-cols-2 w-60 pt-8 items-center"> */}
        {/* <label
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
              /> */}
        {/* </label> */}
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
        {/* </div> */}
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
        {/* </div> */}
        {/* Legacy openTab=3 grid removed — every method now lives in the
            single flat grid above. */}

        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex text-yellow outline-none focus:outline-none mt-8">
                <span>{tr('comment_on_the_order')}</span>
                {/*
                          Use the `open` render prop to rotate the icon when the panel is open
                        */}
                <ChevronRightIcon
                  className={`w-6 transform ${
                    open ? 'rotate-90' : '-rotate-90'
                  }`}
                />
              </DisclosureButton>
              <Transition
                show={open}
                enter="transition duration-300 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-300 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <DisclosurePanel>
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
                </DisclosurePanel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
      {/* Order items — visible on every viewport. Hiding the line items
          on mobile forced the customer to trust the cart from memory. */}
      <div className="w-full bg-white my-5 rounded-2xl order-summary-section">
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
                  } w-20 h-20 flex rounded-full overflow-hidden flex-shrink-0`}
                >
                  <div className="w-1/2 relative overflow-hidden">
                    <img
                      src={getAssetUrl(lineItem?.variant?.product?.assets)}
                      className="absolute h-full max-w-none left-0"
                      alt=""
                    />
                  </div>
                  <div className="w-1/2 relative overflow-hidden">
                    <img
                      src={getAssetUrl(
                        lineItem?.child[0].variant?.product?.assets
                      )}
                      className="absolute h-full max-w-none right-0"
                      alt=""
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`${
                    isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                  } flex items-center`}
                >
                  <img
                    src={getAssetUrl(lineItem?.variant?.product?.assets)}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                    alt=""
                  />
                </div>
              )}
              <div
                className={`${
                  isProductInStop.includes(lineItem.id) ? 'opacity-25' : ''
                }font-bold md:text-xl text-base space-y-2 text-center  w-1/3`}
              >
                {lineItem.child && lineItem.child.length == 1 ? (
                  `${
                    lineItem?.variant?.product?.attribute_data?.name?.[
                      channelName
                    ]?.[locale || 'ru'] ||
                    lineItem?.variant?.product?.attribute_data?.name?.[
                      channelName
                    ]?.['ru'] ||
                    ''
                  } + ${lineItem?.child
                    .filter(
                      (v: any) =>
                        lineItem?.variant?.product?.box_id !=
                        v?.variant?.product?.id
                    )
                    .map(
                      (v: any) =>
                        v?.variant?.product?.attribute_data?.name?.[
                          channelName
                        ]?.[locale || 'ru'] ||
                        v?.variant?.product?.attribute_data?.name?.[
                          channelName
                        ]?.['ru'] ||
                        ''
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
                      : lineItem?.variant?.product?.attribute_data?.name?.[
                          channelName
                        ]?.[locale || 'ru'] ||
                        lineItem?.variant?.product?.attribute_data?.name?.[
                          channelName
                        ]?.['ru'] ||
                        ''}
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
                        className="bg-yellow rounded-full px-2 py-1  text-xs text-white"
                        key={mod.id}
                      >
                        {locale == 'uz'
                          ? mod.name_uz
                          : locale == 'ru'
                          ? mod.name
                          : locale == 'en'
                          ? mod.name_en
                          : ''}
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
                  currency(lineItem.total, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${
                      locale == 'uz'
                        ? "so'm"
                        : locale == 'ru'
                        ? 'сум'
                        : locale == 'en'
                        ? 'sum'
                        : ''
                    }`,
                    precision: 0,
                  }).format()}
              </div>
            </div>
          ))}
        {!isEmpty && (
          <div>
            <div
              className={`flex justify-between items-center mt-8 ${
                isMobile ? 'hidden' : ''
              }`}
            >
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
                  symbol: `${
                    locale == 'uz'
                      ? "so'm"
                      : locale == 'ru'
                      ? 'сум'
                      : locale == 'en'
                      ? 'sum'
                      : ''
                  }`,
                  precision: 0,
                }).format()}
              </div>
            </div>
            <div className="flex items-center mt-8 text-2xl">
              <div className="font-bold">{tr('cutlery_and_napkins')}</div>
              <label htmlFor="N" className="ml-12">
                <div className="font-bold mx-2">{tr('no')}</div>
              </label>
              <input
                type="radio"
                value={'N'}
                checked={cutlery === 'N'}
                className={` ${
                  cutlery ? 'text-yellow' : 'bg-gray-200'
                } border-2 border-yellow form-checkbox rounded-md text-yellow outline-none focus:outline-none active:outline-none focus:border-yellow`}
                onChange={cutleryHandler}
                id="N"
              />
              <label htmlFor="Y">
                <div className="font-bold mx-2">{tr('yes')}</div>
              </label>
              <input
                type="radio"
                value={'Y'}
                checked={cutlery === 'Y'}
                className={` ${
                  cutlery ? 'text-yellow' : 'bg-gray-200'
                } border-2 border-yellow form-checkbox rounded-md text-yellow outline-none focus:outline-none active:outline-none focus:border-yellow`}
                onChange={cutleryHandler}
                id="Y"
              />
            </div>
          </div>
        )}
      </div>
      {/* Mobile cutlery */}
      {isMobile && !isEmpty && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="text-sm font-medium">{tr('cutlery_and_napkins')}</div>
          <div className="flex items-center gap-2">
            <label htmlFor="mob_N" className="flex items-center gap-1 text-sm">
              {tr('no')}
              <input
                type="radio"
                value="N"
                checked={cutlery === 'N'}
                onChange={cutleryHandler}
                id="mob_N"
                className="border-2 border-yellow form-checkbox rounded-md text-yellow"
              />
            </label>
            <label htmlFor="mob_Y" className="flex items-center gap-1 text-sm">
              {tr('yes')}
              <input
                type="radio"
                value="Y"
                checked={cutlery === 'Y'}
                onChange={cutleryHandler}
                id="mob_Y"
                className="border-2 border-yellow form-checkbox rounded-md text-yellow"
              />
            </label>
          </div>
        </div>
      )}
      <div className={`w-full bg-white my-5 rounded-2xl order-confirm-section`}>
        <div className={`${isMobile ? 'hidden' : 'md:flex'}`}>
          {!!user?.user?.sms_sub != true ||
            (!!user?.user?.email_sub != true && (
              <div className="mr-8 text-gray-400">{tr('agree_to_send')}</div>
            ))}
          {!!user?.user?.sms_sub != true && (
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
          {!!user?.user?.email_sub != true && authEmail && (
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
        <div
          className={`mt-5 text-gray-400 text-sm md:flex border-b pb-8 ${
            isMobile ? 'hidden' : ''
          }`}
        >
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
        <Transition appear show={isShowPrivacy}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={closePrivacy}
            initialFocus={privacyButtonRef}
          >
            <div className="min-h-screen px-4 text-center">
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
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <TransitionChild
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
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>
        {/* Desktop: sticky bottom CTA bar so the user never has to scroll
            to the end to find "Оформить заказ" — verified +10–20% AtC
            uplift pattern (FunnelKit, GemPages 2025). On mobile the
            sticky behavior is already handled by mobile-checkout-wrap
            CSS in MobileOrdersApp. */}
        <div className="md:flex justify-between mt-8 space-y-2 md:space-y-0 md:sticky md:bottom-4 md:z-30 md:bg-white md:rounded-full md:shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:px-3 md:py-2">
          <button
            className="md:text-xl text-gray-400 bg-gray-200 flex h-12 items-center justify-between px-12 rounded-full md:w-80 w-full"
            onClick={(e) => {
              e.preventDefault()
              router.push(`/${activeCity?.slug}/cart/`)
            }}
          >
            {/* Plain <img> instead of next/image — these little chevrons
                were a noisy element type on minified prod and don't
                benefit from the optimizer (already 20px). */}
            <img src="/left.png" alt="" width={20} height={20} />{' '}
            {tr('back_to_basket')}
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
                {tr('checkout')}
                {isMobile && totalPrice > 0 && (
                  <span className="ml-1">
                    ·{' '}
                    {currency(totalPrice, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: `${
                        locale == 'uz' ? "so'm" : locale == 'ru' ? 'сум' : 'sum'
                      }`,
                      precision: 0,
                    }).format()}
                  </span>
                )}
                {!isMobile && (
                  <img src="/right.png" alt="" width={20} height={20} />
                )}
              </>
            )}
          </button>
        </div>
      </div>
      <Transition appear show={isPhoneConfirmOpen}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => {}}
          initialFocus={authButtonRef}
        >
          <div className="min-h-screen px-4 text-center">
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
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <TransitionChild
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
                    <DialogTitle as="h3" className="leading-6 text-3xl">
                      $
                      {locale == 'uz'
                        ? 'Buyurtmani tasdiqlash'
                        : locale == 'ru'
                        ? 'Подтвердить заказ'
                        : locale == 'en'
                        ? 'Confirm order'
                        : ''}
                    </DialogTitle>
                    {/* DialogDescription is deprecated in @headlessui v2; use a plain p */}
                    <p>
                      $
                      {locale == 'uz'
                        ? 'SMS-dan kodni kiriting'
                        : locale == 'ru'
                        ? 'Введите код из смс'
                        : locale == 'en'
                        ? 'Enter the code from the SMS'
                        : ''}
                    </p>
                    <div>
                      <form onSubmit={handlePasswordSubmit(saveOrder)}>
                        <div className="mt-10">
                          <label className="text-sm text-gray-400 mb-2 block">
                            $
                            {locale == 'uz'
                              ? 'SMS-dan kod'
                              : locale == 'ru'
                              ? 'Код из смс'
                              : locale == 'en'
                              ? 'Code from SMS'
                              : ''}
                          </label>
                          <OtpInput
                            value={otpCode}
                            onChange={handleOtpChange}
                            numInputs={4}
                            inputType="number"
                            containerStyle={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '0.375rem',
                              justifyContent: 'center',
                            }}
                            renderInput={(props) => (
                              <input
                                {...props}
                                className={`${styles.digitField} border border-yellow w-16 rounded-3xl h-12 outline-none focus:outline-none text-center`}
                              />
                            )}
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
                                : locale == 'ru'
                                ? 'Получить код'
                                : locale == 'en'
                                ? 'Get code'
                                : ''}
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
                            ) : locale == 'ru' ? (
                              'Подтвердить'
                            ) : locale == 'en' ? (
                              'Confirm'
                            ) : (
                              ''
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default memo(OrdersApp)
