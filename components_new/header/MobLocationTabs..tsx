import React, {
  memo,
  Fragment,
  useEffect,
  useRef,
  useState,
  useMemo,
  FC,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react'
import { Menu, Transition, Disclosure } from '@headlessui/react'
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
import { useForm, SubmitHandler } from 'react-hook-form'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
import axios from 'axios'
import Downshift from 'downshift'
import debounce from 'lodash.debounce'
import { useUI } from '@components/ui/context'
import { toast } from 'react-toastify'
import { City } from '@commerce/types/cities'
import router, { useRouter } from 'next/router'
import { chunk, sortBy } from 'lodash'
import { DateTime } from 'luxon'
import Cookies from 'js-cookie'
import getAddressList from '@lib/load_addreses'
import { Address } from '@commerce/types/address'
import { XIcon } from '@heroicons/react/outline'
import useCart from '@framework/cart/use-cart'

const { publicRuntimeConfig } = getConfig()

let webAddress = publicRuntimeConfig.apiUrl
interface AnyObject {
  [key: string]: any
}

const MobLocationTabs: FC = () => {
  const { t: tr } = useTranslation('common')
  const { locale, pathname, query } = useRouter()
  const {
    locationData,
    setLocationData,
    cities,
    activeCity,
    setActiveCity,
    setLocationTabsClosable,
    closeMobileLocationTabs,
    locationTabsClosable,
    setStopProducts,
    addressId,
    setAddressId,
    setAddressList,
    openSignInModal,
    addressList,
    selectAddress,
  } = useUI()

  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }
  const { mutate } = useCart({
    cartId,
    locationData,
  })
  const [tabIndex, setTabIndex] = useState(
    locationData?.deliveryType || 'deliver'
  )
  const [pickupIndex, setPickupIndex] = useState(1)
  const [pickupPoints, setPickupPoint] = useState([] as any[])

  const downshiftControl = useRef<any>(null)
  const map = useRef<any>(null)
  const [ymaps, setYmaps] = useState<any>(null)
  const objects = useRef<any>(null)
  const [geoSuggestions, setGeoSuggestions] = useState([])
  const [isSearchingTerminals, setIsSearchingTerminals] = useState(false)
  const [yandexGeoKey, setYandexGeoKey] = useState('')

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

  const [mapCenter, setMapCenter] = useState(
    (locationData?.location && locationData.location.length
      ? locationData?.location
      : [activeCity?.lat, activeCity?.lon]) as number[]
  )
  const [mapZoom, setMapZoom] = useState(
    ((locationData?.location && locationData.location.length ? 17 : 10) ||
      activeCity?.map_zoom) as number
  )

  const [activePoint, setActivePoint] = useState(
    (locationData ? locationData.terminal_id : null) as number | null
  )

  const [configData, setConfigData] = useState({} as any)

  let currentAddress = ''
  if (activeCity.active) {
    if (locale == 'ru') {
      currentAddress = 'Узбекистан, ' + activeCity.name + ','
    } else {
      currentAddress = "O'zbekiston, " + activeCity.name_uz + ','
    }
  }

  const { register, handleSubmit, getValues, setValue, watch, reset } =
    useForm<AnyObject>({
      defaultValues: {
        address: locationData?.address || currentAddress,
        flat: locationData?.flat || '',
        house: locationData?.house || '',
        entrance: locationData?.entrance || '',
        door_code: locationData?.door_code || '',
        label: locationData?.label || '',
        addressId: addressId || null,
      },
    })

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

  useEffect(() => {
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
    debounce(addressInputChangeHandler, 400),
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
    if (city) setMapCenter([+city.lat, +city.lon])
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

  const setSelectedAddress = async (selection: any) => {
    setMapCenter([selection.coordinates.lat, selection.coordinates.long])
    setSelectedCoordinates([
      {
        ...selection,
        key: `${selection.coordinates.lat}${selection.coordinates.long}`,
      },
    ])
    setMapZoom(17)
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
    setValue('address', selection.formatted)
    downshiftControl?.current?.reset({
      inputValue: selection.formatted,
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

  const onSubmit: SubmitHandler<AnyObject> = (data) => {
    saveDeliveryData(data, null)
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

  const saveDeliveryData = async (
    data: Object = {},
    event: React.MouseEvent | null
  ) => {
    event?.preventDefault()
    event?.stopPropagation()
    setIsSearchingTerminals(true)
    if (!Object.keys(data).length) {
      data = getValues()
    }

    if (
      !locationData ||
      !locationData.location ||
      !locationData.location.length
    ) {
      toast.warn(tr('location_tabs_incorrect_data'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setIsSearchingTerminals(false)
      return
    }

    const { data: terminalsData } = await axios.get(
      `${webAddress}/api/terminals/find_nearest?lat=${locationData.location[0]}&lon=${locationData.location[1]}`
    )

    if (terminalsData.data && !terminalsData.data.items.length) {
      toast.warn(
        terminalsData.data.message
          ? terminalsData.data.message
          : 'Ресторан не найден',
        {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        }
      )
      setIsSearchingTerminals(false)
      return
    } else {
      let currentTerminal = terminalsData.data.items[0]
      if (!currentTerminal.isWorking) {
        toast.warn(tr('nearest_terminal_is_closed'), {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        })

        setIsSearchingTerminals(false)
        return
      }
    }

    setIsSearchingTerminals(false)
    if (terminalsData.data) {
      setLocationData({
        ...locationData,
        ...data,
        // location: [
        //   terminalsData.data.items[0].latitude,
        //   terminalsData.data.items[0].longitude,
        // ],
        terminal_id: terminalsData.data.items[0].id,
        terminalData: terminalsData.data.items[0],
      })

      const { data: terminalStock } = await axios.get(
        `${webAddress}/api/terminals/get_stock?terminal_id=${terminalsData.data.items[0].id}`
      )

      if (!terminalStock.success) {
        toast.warn(terminalStock.message, {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        })
        return
      } else {
        setStopProducts(terminalStock.data)
      }

      setLocationTabsClosable(false)
      closeMobileLocationTabs()
    }

    const otpToken = Cookies.get('opt_token')
    if (otpToken) {
      if (addressId) {
        await setCredentials()
        await axios.post(
          `${webAddress}/api/address/${addressId}`,

          {
            ...data,
            lat: locationData.location[0],
            lon: locationData.location[1],
            addressId: undefined,
          },
          {
            headers: {
              Authorization: `Bearer ${otpToken}`,
            },
          }
        )
      } else {
        await setCredentials()
        const { data: addressData } = await axios.post(
          `${webAddress}/api/address/new`,
          {
            ...data,
            lat: locationData.location[0],
            lon: locationData.location[1],
            addressId: undefined,
          },
          {
            headers: {
              Authorization: `Bearer ${otpToken}`,
            },
          }
        )

        setAddressId(addressData.data.id)
      }
    }
    let { data: basket } = await axios.get(
      `${webAddress}/api/baskets/${cartId}?delivery_type=pickup`
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
      discountTotal: basket.data.discount_total,
    }

    await mutate(basketResult, false)
  }

  const submitPickup = async () => {
    if (!activePoint) {
      toast.warn(`${tr('pickup_point_not_selected')}`, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    }

    const { data: terminalStock } = await axios.get(
      `${webAddress}/api/terminals/get_stock?terminal_id=${activePoint}`
    )

    if (!terminalStock.success) {
      toast.warn(terminalStock.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    } else {
      setStopProducts(terminalStock.data)
    }

    let { data: basket } = await axios.get(
      `${webAddress}/api/baskets/${cartId}?delivery_type=pickup`
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
      discountTotal: basket.data.discount_total,
    }

    await mutate(basketResult, false)
    setLocationTabsClosable(false)
    closeMobileLocationTabs()
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
  const discountValue = useMemo(() => {
    let res = 0

    if (configData.discount_end_date) {
      if (DateTime.now().toFormat('E') != configData.discount_disable_day) {
        if (DateTime.now() <= DateTime.fromSQL(configData.discount_end_date)) {
          if (configData.discount_value) {
            res = configData.discount_value
          }
        }
      }
    }
    return res
  }, [configData])

  const addresClear = watch('address')

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }

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

  return (
    <>
      <div className="flex items-center pt-5 mb-8">
        {locationTabsClosable && (
          <span
            onClick={() => {
              if (locationTabsClosable) {
                setLocationTabsClosable(false)
                closeMobileLocationTabs()
              }
            }}
            className="flex"
          >
            <Image src="/assets/back.png" width="24" height="24" />
          </span>
        )}
        <div className="text-lg flex-grow text-center">Адрес</div>
      </div>
      <div className="bg-gray-100 flex rounded-full w-full h-11 items-center">
        <button
          className={`${
            tabIndex == 'deliver' ? 'bg-yellow text-white' : ' text-gray-400'
          } flex-1 font-bold  text-[16px] rounded-full outline-none focus:outline-none  h-11`}
          onClick={() => changeTabIndex('deliver')}
        >
          {tr('delivery')}
        </button>
        <button
          className={`${
            tabIndex == 'pickup' ? 'bg-yellow text-white' : ' text-gray-400'
          } flex-1 font-bold  text-[16px] rounded-full outline-none focus:outline-none  h-11`}
          onClick={() => changeTabIndex('pickup')}
        >
          {tr('pickup')}{' '}
          {discountValue > 0 && (
            <span className="ml-2 text-red-700 text-2xl">
              -{discountValue}%
            </span>
          )}
        </button>
      </div>
      {tabIndex == 'deliver' && (
        <div className="mt-5">
          <div className="flex justify-between">
            <div className="text-gray-400 font-bold text-[18px]">
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
                    height="270px"
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
                <div className="grid grid-cols-3 gap-1">
                  {addressList.map((item: Address) => (
                    <div
                      key={item.id}
                      className={`px-2 py-1 truncate rounded-full cursor-pointer relative pr-6 ${
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
                        <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="mt-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="font-bold text-[18px]">{tr('address')}</div>
              <div className="mt-3 space-y-6">
                <Downshift
                  onChange={(selection) => setSelectedAddress(selection)}
                  ref={downshiftControl}
                  itemToString={(item) =>
                    item ? item.formatted : watch('address')
                  }
                  initialInputValue={locationData?.address || currentAddress}
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
                        className="w-full relative"
                        {...getRootProps(undefined, { suppressRefError: true })}
                      >
                        <input
                          type="text"
                          {...register('address')}
                          {...getInputProps({
                            onChange: debouncedAddressInputChangeHandler,
                          })}
                          placeholder={tr('address')}
                          className="bg-gray-100 focus:outline-none outline-none px-8 py-2 rounded-full w-full"
                        />
                        {addresClear && (
                          <button
                            className="absolute focus:outline-none inset-y-0 outline-none right-3 text-gray-400"
                            onClick={() => resetField('address')}
                          >
                            <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                          </button>
                        )}
                        <ul
                          {...getMenuProps()}
                          className="absolute w-full z-[1000] rounded-[15px] shadow-lg"
                        >
                          {isOpen
                            ? geoSuggestions.map((item: any, index: number) => (
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
                              ))
                            : null}
                        </ul>
                      </div>
                    </>
                  )}
                </Downshift>
                <div className="flex justify-between">
                  <input
                    type="text"
                    {...register('house')}
                    placeholder={tr('house')}
                    className="bg-gray-100 px-8 py-2 rounded-full w-40 "
                  />
                  <input
                    type="text"
                    {...register('flat')}
                    placeholder={tr('flat')}
                    className="bg-gray-100 px-8 py-2 rounded-full w-40  outline-none focus:outline-none"
                  />
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
                          <div className="flex mt-3 justify-between">
                            <div>
                              <input
                                type="text"
                                {...register('entrance')}
                                placeholder={tr('entrance')}
                                className="bg-gray-100 px-8 py-2 rounded-full w-40  outline-none focus:outline-none"
                              />
                            </div>
                            <div className="">
                              <input
                                type="text"
                                {...register('door_code')}
                                placeholder={tr('door_code')}
                                className="bg-gray-100 px-8 py-2 rounded-full w-40 outline-none focus:outline-none"
                              />
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </div>
              <div className="mt-5">
                <div className="flex">
                  <input
                    type="text"
                    {...register('label')}
                    placeholder={tr('address_label')}
                    className="bg-gray-100 px-8 py-2 rounded-full outline-none w-full focus:outline-none"
                  />
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
              <div className="flex mt-12 justify-center">
                <button
                  type="submit"
                  className="bg-yellow font-bold px-12 py-3 rounded-full text-[18px] text-white outline-none focus:outline-none"
                  disabled={isSearchingTerminals}
                  onClick={(event: React.MouseEvent) =>
                    saveDeliveryData(undefined, event)
                  }
                >
                  {isSearchingTerminals ? (
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
                    tr('confirm')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {tabIndex == 'pickup' && (
        <div className="mt-5">
          {/* <div> */}
          <div className="font-bold text-[18px] text-gray-400">
            {tr('select_pizzeries')}{' '}
          </div>
          {/* <div className="flex mt-3"> */}
          {/* <div
                className={`${
                  pickupIndex == 1 ? ' text-yellow' : 'text-gray-400'
                } cursor-pointer font-bold text-[18px] mr-5`}
                onClick={() => {
                  setPickupIndex(1)
                }}
              >
                На карте
              </div> */}
          {/* <div
                className={`${
                  pickupIndex == 2 ? ' text-yellow' : 'text-gray-400'
                } cursor-pointer font-bold text-[18px]`}
                onClick={() => {
                  setPickupIndex(2)
                }}
              >
                Списком
              </div> */}
          {/* </div> */}
          {/* </div> */}
          {/* <div className="w-full mt-5">
          <input
            type="text"
            {...register('address')}
            placeholder="Адрес"
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
                      height="270px"
                      modules={[
                        'control.ZoomControl',
                        'control.FullscreenControl',
                        'control.GeolocationControl',
                      ]}
                    >
                      {pickupPoints.map((point) => (
                        <div>
                          <Placemark
                            modules={['geoObject.addon.balloon']}
                            defaultGeometry={point.mapCenter}
                            key={point.id}
                            onClick={() => setActivePoint(point.id)}
                            options={{
                              iconColor:
                                activePoint && activePoint.id == point.id
                                  ? '#FAAF04'
                                  : '#1E98FF',
                              iconLayout: 'default#image',
                              iconImageHref: '/assets/locationLogo.png',
                              iconImageSize: [40, 40],
                            }}
                          />
                        </div>
                      ))}
                    </Map>
                  </div>
                </YMaps>
                {activePoint && (
                  <div className="w-72">
                    <div className="font-bold text-base">
                      {activePoint.label}
                    </div>
                    <div>{activePoint.desc}</div>
                  </div>
                )}
              </> */}
            {/* )} */}
            {/* {pickupIndex == 2 && ( */}
            <div className="space-y-3">
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
          <div className="flex mt-12 justify-center">
            <button
              type="submit"
              className={`${
                activePoint ? 'bg-yellow' : 'bg-gray-200'
              } font-bold px-12 rounded-full text-[18px] text-white outline-none focus:outline-none w-full py-2`}
              disabled={!activePoint}
              onClick={submitPickup}
            >
              {tr('confirm')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(MobLocationTabs)
