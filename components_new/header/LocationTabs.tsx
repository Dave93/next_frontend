import React, {
  memo,
  Fragment,
  useEffect,
  useRef,
  useState,
  useMemo,
  FC,
  createRef,
  useCallback,
  SetStateAction,
} from 'react'
import { Menu, Transition, Disclosure } from '@headlessui/react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@heroicons/react/solid'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
  PlacemarkGeometry,
} from 'react-yandex-maps'
import { useForm } from 'react-hook-form'
import Autosuggest from 'react-autosuggest'
import useSWR from 'swr'
import getConfig from 'next/config'
import axios from 'axios'
import Downshift from 'downshift'
import debounce from 'lodash.debounce'
import { useUI } from '@components/ui/context'

const { publicRuntimeConfig } = getConfig()

interface Props {
  setOpen?: any
}

const LocationTabs: FC<Props> = ({ setOpen }) => {
  const { locationData, setLocationData } = useUI()
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
  const [pickupPoints, setPickupPoint] = useState([
    {
      id: '8fbb73fa-5b54-e46e-016f-39e9c456cf69',
      label: 'Эко парк',
      active: false,
      mapCenter: [41.311801, 69.2937486],
      desc: `Ц-1 Экопарк
📱 712051111
Режим работы:
10:00 – 22:00
М. Улугбекский р. Ц-1 Узбекистон овози 49
Ориентир: Экопарк, школа №64
🚗 доставка
🅿️ парковка`,
      mapZoom: 11.76,
    },
    {
      id: 'b49bc4a2-b9ac-6869-0172-959449754927',
      label: 'Ойбек',
      active: false,
      mapCenter: [41.295713, 69.277302],
      desc: `Ойбек
📱 712051111
Режим работы:
10:00 – 03:00
Мирабадский р. Ойбек 49
🚗 доставка
🅿️ парковка`,
      mapZoom: 12.73,
    },
    {
      id: '8fbb73fa-5b54-e46e-016f-39f4c194a71b',
      label: 'Parus',
      active: false,
      mapCenter: [41.2919486, 69.2111247],
      desc: `ТРЦ Parus
📱 712051111
Режим работы:
10:00 – 22:00
Чиланзарский р-н, Катартал 60, дом 2
Ориентир: ТРЦ Parus 4-этаж
Имеются:
🚗 доставка
🏰 детская площадка
🅿️ парковка`,
      mapZoom: 13.06,
    },
    {
      id: 'd40b7507-18e0-de80-0176-1021c8785833',
      label: 'Samarqand Darvoza',
      active: false,
      mapCenter: [41.316332, 69.231129],
      desc: `ТРЦ Samarqand Darvoza
📱 712051111
Режим работы:
10:00 – 22:00
Шайхантаурский р. Коратош 5А
🚗 доставка
🏰 детская площадка
🅿️ парковка`,
      mapZoom: 13.06,
    },
    {
      id: '796859c4-0dbb-e58b-0174-5e024e94adf8',
      label: 'Сергели',
      active: false,
      mapCenter: [41.222536, 69.2249],
      desc: `Сергели
📱 712051111
Режим работы:
10:00 – 22:00
Сергелийский р. Янги Сергели 11
🚗 доставка
🏰 детская площадка
🅿️ парковка`,
      mapZoom: 13.06,
    },
    {
      id: '8fbb73fa-5b54-e46e-016f-3c2c544b153e',
      label: 'Буюк ипак йули',
      active: false,
      mapCenter: [41.3272276, 69.3393392],
      desc: `Буюк ипак йули
📱 712051111
Режим работы:
10:00 – 22:00
М. Улугбекский р. Буюк ипак йули 154
🚗 доставка
🏰 детская площадка
🅿️ парковка`,
      mapZoom: 13.06,
    },
    {
      id: '8fbb73fa-5b54-e46e-016f-39c03efeb44d',
      label: 'O’zbegim',
      active: false,
      mapCenter: [40.7863073, 72.346673],
      desc: `Андижан ТРЦ O’zbegim
📱 979996060
Режим работы:
10:00 – 22:00
г. Андижан, проспект Чулпон 10
Ориентир:
ТРЦ O’zbegim
🚗 доставка
🏰 детская площадка
🅿️ парковка`,
      mapZoom: 13.06,
    },
    {
      id: '26639a16-7813-3e88-0178-74cefbe829bd',
      label: 'Compas',
      active: false,
      mapCenter: [41.2389984, 69.3286705],
      desc: ` ТРЦ Compass
📱 712051111
Режим работы:
10:00 – 22:00
Бектемирский р. Пересечение улицы Фаргона йули и ТКАД
Ориентир: Мост Куйлюк
🚗 доставка
🏰 детская площадка
🅿️ парковка`,
      mapZoom: 13.06,
    },
    {
      id: '0ee0d30c-0662-e682-0174-90531d2bc636',
      label: 'Nukus Asia.uz',
      active: false,
      mapCenter: [41.350566, 69.217489],
      desc: `ТРЦ Nukus Asia.uz
📱 712051111
Режим работы:
10:00 – 22:00
Алмазарский р. Шифокорлар 8
Ориентир: Asia.uz Nukus
🚗 доставка
🏰 детская площадка
🅿️парковка`,
      mapZoom: 13.06,
    },
    {
      id: '8fbb73fa-5b54-e46e-016f-39c9927685e2',
      label: 'Миллий тикланиш',
      active: false,
      mapCenter: [40.764064, 72.355316],
      desc: `Миллий тикланиш
📱 979996060
Режим работы:
10:00 – 03:00
г. Андижан, Миллий тикланиш 26
🚗 доставка
🅿️ парковка`,
      mapZoom: 13.06,
    },
    {
      id: '0d562a04-0abe-72bc-0171-1ccd85df7a57',
      label: 'Самарканд',
      active: false,
      mapCenter: [39.644253, 66.9537613],
      desc: `Самарканд
📱 977143315
Режим работы:
10:00 – 03:00
г. Самарканд, ул. О. Махмудова
🚗 доставка
🅿️ парковка`,
      mapZoom: 13.06,
    },
    {
      id: '0e1f7fcc-1db0-a410-0173-236144e3b4e4',
      label: 'Коканд',
      active: false,
      mapCenter: [40.537005, 70.93409],
      desc: `г. Коканд
📱 907034040
Режим работы:
10:00 – 03:00
г. Коканд, Истиклол 10
🚗 доставка
🅿️ парковка`,
      mapZoom: 13.06,
    },
  ])

  const [geoSuggestions, setGeoSuggestions] = useState([])

  const activeLabel = cities.find((item) => item.active)?.label
  const activeCity = cities.find((item) => item.active)
  const activePoint = pickupPoints.find((item) => item.active)

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
    (locationData?.location || activeCity?.mapCenter) as number[]
  )
  const [mapZoom, setMapZoom] = useState(
    ((locationData?.location ? 17 : 10) || activeCity?.mapZoom) as number
  )

  const [configData, setConfigData] = useState({} as any)

  const changeTabIndex = (index: string) => {
    setLocationData({ ...locationData, deliveryType: index })
    setTabIndex(index)
  }

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
    return
  }, [])

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

    const activeCity = cities.find((item) => item.id == id)
    if (activeCity) setMapCenter(activeCity.mapCenter)
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
  }

  const setActivePoint = (id: string) => {
    setPickupPoint(
      pickupPoints.map((item) => {
        if (item.id == id) {
          item.active = true
        } else {
          item.active = false
        }
        return item
      })
    )
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

  const { register, handleSubmit, getValues } = useForm({
    defaultValues: {
      address: locationData?.address || '',
      flat: locationData?.flat || '',
      house: locationData?.house || '',
      entrance: locationData?.entrance || '',
      door_code: locationData?.door_code || '',
    },
  })
  const onSubmit = (data: Object) => {
    saveDeliveryData(data)
  }

  const saveDeliveryData = (data: Object = {}) => {
    if (!data) {
      data = getValues()
    }
    setLocationData({ ...locationData, ...data })
    setOpen(false)
  }

  return (
    <>
      <div className="bg-gray-100 flex rounded-full w-full">
        <button
          className={`${
            tabIndex == 'deliver' ? 'bg-yellow text-white' : ' text-gray-400'
          } flex-1 font-bold py-3 text-[18px] rounded-full outline-none focus:outline-none`}
          onClick={() => changeTabIndex('deliver')}
        >
          Доставка
        </button>
        <button
          className={`${
            tabIndex == 'pickup' ? 'bg-yellow text-white' : ' text-gray-400'
          } flex-1 font-bold py-3 text-[18px] rounded-full outline-none focus:outline-none`}
          onClick={() => changeTabIndex('pickup')}
        >
          Самовывоз
        </button>
      </div>
      {tabIndex == 'deliver' && (
        <div className="mt-8">
          <div className="flex justify-between">
            <div className="text-gray-400 font-bold text-[18px]">
              Укажите свой адрес
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
          <div className="mt-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="font-bold text-[18px] text-gray-400">Адрес:</div>
              <div className="flex justify-between mt-3">
                <Downshift
                  onChange={(selection) => setSelectedAddress(selection)}
                  itemToString={(item) => (item ? item.formatted : '')}
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
                        {...getRootProps(undefined, { suppressRefError: true })}
                      >
                        <input
                          type="text"
                          {...register('address')}
                          {...getInputProps({
                            onChange: debouncedAddressInputChangeHandler,
                          })}
                          placeholder="Адрес"
                          className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                        />
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
                <div className="mx-5 w-3/12">
                  <input
                    type="text"
                    {...register('flat')}
                    placeholder="Квартира"
                    className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                  />
                </div>
                <div className="w-2/12">
                  <input
                    type="text"
                    {...register('house')}
                    placeholder="Дом"
                    className="bg-gray-100 px-8 py-3 rounded-full w-full"
                  />
                </div>
              </div>

              <div className="mt-5">
                <Disclosure defaultOpen={true}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex text-yellow w-1/4 outline-none focus:outline-none">
                        <span>Указать домофон и подъезд</span>
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
                                placeholder="Подъезд"
                                className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                              />
                            </div>
                            <div className="mx-5">
                              <input
                                type="text"
                                {...register('door_code')}
                                placeholder="Код от домофона"
                                className="bg-gray-100 px-8 py-3 rounded-full w-full outline-none focus:outline-none"
                              />
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="bg-yellow font-bold px-12 py-3 rounded-full text-[18px] text-white outline-none focus:outline-none"
                  onClick={() => saveDeliveryData()}
                >
                  Подтвердить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {tabIndex == 'pickup' && (
        <div className="mt-8">
          <div className="flex">
            <div className="font-bold text-[18px] text-gray-400">
              Выберите пиццерии:
            </div>
            <div
              className={`${
                pickupIndex == 1 ? ' text-yellow' : 'text-gray-400'
              } cursor-pointer font-bold text-[18px] mx-5`}
              onClick={() => {
                setPickupIndex(1)
              }}
            >
              На карте
            </div>
            <div
              className={`${
                pickupIndex == 2 ? ' text-yellow' : 'text-gray-400'
              } cursor-pointer font-bold text-[18px]`}
              onClick={() => {
                setPickupIndex(2)
              }}
            >
              Списком
            </div>
          </div>
          <div className="mt-5">
            {pickupIndex == 1 && (
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
                    height="530px"
                    modules={[
                      'control.ZoomControl',
                      'control.FullscreenControl',
                      'control.GeolocationControl',
                    ]}
                  >
                    {pickupPoints.map((point) => (
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
                        }}
                        properties={{
                          balloonContentBody: `<b>${point.label}</b> <br />
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
            )}
            {pickupIndex == 2 && (
              <div className="gap-5 grid grid-cols-2">
                {pickupPoints.map((point) => (
                  <div
                    key={point.id}
                    className={`border flex items-start p-3 rounded-[15px] cursor-pointer ${
                      activePoint && activePoint.id == point.id
                        ? 'border-yellow'
                        : 'border-gray-400'
                    }`}
                    onClick={() => setActivePoint(point.id)}
                  >
                    <div
                      className={`border mr-4 mt-1 rounded-full ${
                        activePoint && activePoint.id == point.id
                          ? 'border-yellow'
                          : 'border-gray-400'
                      }`}
                    >
                      <div
                        className={`h-3 m-1 rounded-full w-3 ${
                          activePoint && activePoint.id == point.id
                            ? 'bg-yellow'
                            : 'bg-gray-400'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <div className="font-bold">{point.label}</div>
                      <div className="text-gray-400 text-sm">{point.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex mt-10 justify-end">
            <button
              type="submit"
              className={`${
                activePoint ? 'bg-yellow' : 'bg-gray-200'
              } font-bold px-12 py-3 rounded-full text-[18px] text-white outline-none focus:outline-none`}
              disabled={!activePoint}
              onClick={() => {
                // console.log('davr')
              }}
            >
              Подтвердить
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(LocationTabs)
function Dispatch<T>() {
  throw new Error('Function not implemented.')
}
