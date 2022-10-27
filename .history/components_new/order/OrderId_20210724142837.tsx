import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, { Fragment, useState, useMemo, FC, memo, useRef } from 'react'
import { Menu, Transition, Disclosure, Dialog } from '@headlessui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/solid'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
} from 'react-yandex-maps'
import Image from 'next/image'

// interface LocationTabProps {
//   setOpen: Dispatch<SetStateAction<boolean>>
// }

const OrderId: FC = () => {
  //Contacts
  const { t: tr } = useTranslation('common')
  const { user, setUserData } = useUI()

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
  }
  const { register, handleSubmit, reset, watch, formState, getValues } =
    useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        name: user?.user?.name,
        phone: user?.user?.phone,
        email: '',
        address: '',
        flat: '',
        house: '',
        entrance: '',
        door_code: '',
        change: '',
        pay_comment: '',
        card_number: '',
        card_month: '',
        holder_name: '',
        cvv_code: '',
      },
    })

  const onSubmit = (data: any) => console.log(JSON.stringify(data))

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
  const showPrivacy = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setIsShowPrivacy(true)
  }

  const closePrivacy = () => {
    setIsShowPrivacy(false)
  }
  let privacyButtonRef = useRef(null)

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
                  {...register('name')}
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
        </div>
        {tabIndex == 1 && (
          <div className="bg-white p-10 rounded-2xl">
            <div className="flex justify-between">
              <div className="text-gray-400 font-bold text-lg">
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
                    height="520px"
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
                <div className="font-bold text-lg">Адрес</div>
                <div className="mt-3 space-y-6">
                  <div className="flex justify-between w-full">
                    <input
                      type="text"
                      {...register('address')}
                      placeholder="Адрес"
                      className="bg-gray-100 px-8 py-2 rounded-full w-[560px] outline-none focus:outline-none "
                    />
                    <input
                      type="text"
                      {...register('flat')}
                      placeholder="Квартира"
                      className="bg-gray-100 px-8 py-2 rounded-full w-64  outline-none focus:outline-none"
                    />
                    <input
                      type="text"
                      {...register('house')}
                      placeholder="Дом"
                      className="bg-gray-100 px-8 py-2 rounded-full w-56 "
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
                            <div className="flex mt-3">
                              <div>
                                <input
                                  type="text"
                                  {...register('entrance')}
                                  placeholder="Подъезд"
                                  className="bg-gray-100 px-8 py-2 rounded-full w-60  outline-none focus:outline-none"
                                />
                              </div>
                              <div className="mx-5">
                                <input
                                  type="text"
                                  {...register('door_code')}
                                  placeholder="Домофон"
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
        {tabIndex == 2 && (
          <div className="bg-white p-10 rounded-2xl">
            <div>
              <div className="font-bold text-[18px] text-gray-400">
                Поиск ближайшего ресторана:
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
                </>
              )}
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
              deliveryActive !== 1
                ? 'text-gray-400 bg-gray-100'
                : 'bg-yellow text-white'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44`}
            onClick={() => setDeliveryActive(1)}
          >
            Побыстрее
          </button>
          <button
            className={`${
              deliveryActive !== 2
                ? 'text-gray-400 bg-gray-100'
                : 'bg-yellow text-white'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 ml-5`}
            onClick={() => setDeliveryActive(2)}
          >
            Позже
          </button>
        </div>
        <div className="mt-8">
          <Menu>
            <Menu.Button className="flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 bg-gray-100">
              Сегодня
            </Menu.Button>
            <Menu.Items>
              <Menu.Item>{({ active }) => <button>Сегодня</button>}</Menu.Item>
            </Menu.Items>
            <Menu.Button className="flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 bg-gray-100  ml-5">
              Время
            </Menu.Button>
            <Menu.Items>
              <Menu.Item>{({ active }) => <button>Сегодня</button>}</Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
      {/* pay */}
      <div className="w-full bg-white mb-5 rounded-2xl p-10">
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
            Наличными
          </button>
          <button
            className={`${
              openTab !== 2
                ? 'text-gray-400 bg-gray-100'
                : 'bg-yellow text-white'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 ml-5`}
            onClick={() => setOpenTab(2)}
          >
            Картой
          </button>
          <button
            className={`${
              openTab !== 3
                ? 'text-gray-400 bg-gray-100'
                : 'bg-yellow text-white'
            } flex-1 font-bold  rounded-full outline-none focus:outline-none  h-11 md:w-44 ml-5`}
            onClick={() => setOpenTab(3)}
          >
            Онлайн
          </button>
        </div>
        <div className={openTab === 1 ? 'block' : 'hidden'} id="link1">
          <input
            type="text"
            {...register('change')}
            className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-80 bg-gray-100 text-gray-400 mt-8"
            value="Сдача с"
          />
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex text-yellow outline-none focus:outline-none mt-8">
                  <span>Комментарий к заказу </span>
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
                placeholder="Имя держателя"
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
                  <span>Комментарий к заказу </span>
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
          <div className="flex w-[340px] justify-between pt-8 items-center">
            <label className="flex justify-around items-center w-24 h-24 p-3 rounded-2xl border-gray-200 border cursor-pointer">
              <img src="/assets/payme.png" />
              <input
                type="radio"
                defaultValue="payme"
                checked={payType === 'payme'}
                onChange={onValueChange}
                className="hidden"
              />
            </label>
            <label className="flex justify-around items-center w-24 h-24 p-3 rounded-2xl border-gray-200 border cursor-pointer">
              <img src="/assets/click.png" />
              <input
                type="radio"
                defaultValue="click"
                onChange={onValueChange}
                checked={payType === 'click'}
                className="hidden"
              />
            </label>
            <label className="flex justify-around items-center w-24 h-24 p-3 rounded-2xl border-gray-200 border cursor-pointer">
              <img src="/assets/oson.png" />
              <input
                type="radio"
                defaultValue="oson"
                onChange={onValueChange}
                checked={payType === 'oson'}
                className="hidden"
              />
            </label>
          </div>
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex text-yellow outline-none focus:outline-none mt-8">
                  <span>Комментарий к заказу </span>
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
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <div className="font-bold text-xl mb-2">Пепперони</div>
            <div className="text-xs text-gray-400">
              Средняя 32 см, Традиционное тесто
            </div>
          </div>
          <div className="text-xl">36 000 сум</div>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <div className="font-bold text-xl mb-2">Пепперони</div>
            <div className="text-xs text-gray-400">
              Средняя 32 см, Традиционное тесто
            </div>
          </div>
          <div className="text-xl">36 000 сум</div>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <div className="font-bold text-xl mb-2">Пепперони</div>
            <div className="text-xs text-gray-400">
              Средняя 32 см, Традиционное тесто
            </div>
          </div>
          <div className="text-xl">36 000 сум</div>
        </div>
        <div className="flex justify-between items-center mt-8">
          <div>
            <div className="font-bold text-xl mb-2">Сумма заказа:</div>
          </div>
          <div className="text-2xl font-bold">108 000 сум</div>
        </div>
      </div>
      <div className="w-full bg-white mb-5 rounded-2xl p-10">
        <div className="flex">
          <div className="mr-8 text-gray-400">Согласен на отправку</div>
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
            <div>E-mail рассылка</div>
          </label>
        </div>
        <div className="mt-5 text-gray-400 text-sm flex border-b pb-8">
          Нажимая "Оплатить", Вы даёте Согласие на обработку Ваших персональных
          данных и принимаете
          <a
            href="/privacy"
            onClick={showPrivacy}
            className="text-yellow block mx-1"
            target="_blank"
          >
            Пользовательское соглашение
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
          <button className="text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full w-80">
            Оплатить
            <img src="/right.png" />
          </button>
        </div>
      </div>
    </>
  )
}

export default memo(OrderId)
