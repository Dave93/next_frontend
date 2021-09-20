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
} from 'react'
import { Menu, Transition, Disclosure } from '@headlessui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/solid'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
} from 'react-yandex-maps'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'

interface MobLocationTabProps {
  setOpen: Dispatch<SetStateAction<boolean>>
}

const MobLocationTabs: FC<MobLocationTabProps> = ({ setOpen }) => {
  const [tabIndex, setTabIndex] = useState(1)
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

  const activeLabel = cities.find((item) => item.active)?.label
  const activeCity = cities.find((item) => item.active)

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
  const activePoint = pickupPoints.find((item) => item.active)

  const mapState = useMemo<MapState>(() => {
    const baseState: MapStateBase = {
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
    }
    const mapStateCenter: MapStateCenter = {
      center: activeCity?.mapCenter || [],
      zoom: activeCity?.mapZoom || 10,
    }

    const res: MapState = Object.assign({}, baseState, mapStateCenter)
    return res
  }, [activeCity?.mapCenter, activeCity?.mapZoom])

  const { register, handleSubmit } = useForm()
  const onSubmit = (data: Object) => console.log(JSON.stringify(data))
  const { t: tr } = useTranslation('common')

  return (
    <>
      <div className="flex items-center pt-5 mb-8">
        <span onClick={() => setOpen(false)} className="flex">
          <Image src="/assets/back.png" width="24" height="24" />
        </span>
        <div className="text-lg flex-grow text-center">Адрес</div>
      </div>
      <div className="bg-gray-100 flex rounded-full w-full h-11 items-center">
        <button
          className={`${
            tabIndex == 1 ? 'bg-yellow text-white' : ' text-gray-400'
          } flex-1 font-bold  text-[16px] rounded-full outline-none focus:outline-none  h-11`}
          onClick={() => setTabIndex(1)}
        >
          Доставка
        </button>
        <button
          className={`${
            tabIndex == 2 ? 'bg-yellow text-white' : ' text-gray-400'
          } flex-1 font-bold  text-[16px] rounded-full outline-none focus:outline-none  h-11`}
          onClick={() => setTabIndex(2)}
        >
          Самовывоз
        </button>
      </div>
      {tabIndex == 1 && (
        <div className="mt-5">
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
                  height="270px"
                  modules={[
                    'control.ZoomControl',
                    'control.FullscreenControl',
                    'control.GeolocationControl',
                  ]}
                />
              </div>
            </YMaps>
          </div>
          <div className="mt-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="font-bold text-[18px]">Адрес</div>
              <div className="mt-3 space-y-6">
                <div className="w-full">
                  <input
                    type="text"
                    {...register('address')}
                    placeholder="Адрес"
                    className="bg-gray-100 px-8 py-2 rounded-full w-full outline-none focus:outline-none "
                  />
                </div>
                <div className="flex justify-between">
                  <input
                    type="text"
                    {...register('flat')}
                    placeholder="Квартира"
                    className="bg-gray-100 px-8 py-2 rounded-full w-40  outline-none focus:outline-none"
                  />
                  <input
                    type="text"
                    {...register('house')}
                    placeholder="Дом"
                    className="bg-gray-100 px-8 py-2 rounded-full w-40 "
                  />
                </div>
              </div>
              <div className="mt-5">
                <Disclosure defaultOpen={true}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex text-yellow outline-none focus:outline-none">
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
                          <div className="flex mt-3 justify-between">
                            <div>
                              <input
                                type="text"
                                {...register('entrance')}
                                placeholder="Подъезд"
                                className="bg-gray-100 px-8 py-2 rounded-full w-40  outline-none focus:outline-none"
                              />
                            </div>
                            <div className="mx-5">
                              <input
                                type="text"
                                {...register('door_code')}
                                placeholder="Домофон"
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
              <div className="flex mt-12">
                <button
                  type="submit"
                  className="bg-yellow font-bold px-12 py-2 rounded-full text-[18px] text-white outline-none focus:outline-none w-full"
                >
                  Подтвердить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* {tabIndex == 2 && ( */}
        <div className="mt-5">
          <div>
            <div className="font-bold text-[18px] text-gray-400">
              Поиск ближайшего ресторана:
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
          </div>
          <div className="w-full mt-5">
            <input
              type="text"
              {...register('address')}
              placeholder="Адрес"
              className="bg-gray-100 px-8 rounded-full w-full outline-none focus:outline-none py-2"
            />
          </div>
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
            {pickupIndex == 2 && (
              <div className="space-y-3">
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
          <div className="flex mt-12">
            <button
              type="submit"
              className={`${
                activePoint ? 'bg-yellow' : 'bg-gray-200'
              } font-bold px-12 rounded-full text-[18px] text-white outline-none focus:outline-none w-full py-2`}
              disabled={!activePoint}
              onClick={() => {
                // console.log('davr')
              }}
            >
              Подтвердить
            </button>
          </div>
        </div>
      {/* )} */}
    </>
  )
}

export default memo(MobLocationTabs)
