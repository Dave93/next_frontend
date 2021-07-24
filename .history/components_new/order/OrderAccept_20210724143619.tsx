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

const OrderAccept: FC = () => {
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
          <div className="text-xl">36 000 сўм</div>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <div className="font-bold text-xl mb-2">Пепперони</div>
            <div className="text-xs text-gray-400">
              Средняя 32 см, Традиционное тесто
            </div>
          </div>
          <div className="text-xl">36 000 сўм</div>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <div className="font-bold text-xl mb-2">Пепперони</div>
            <div className="text-xs text-gray-400">
              Средняя 32 см, Традиционное тесто
            </div>
          </div>
          <div className="text-xl">36 000 сўм</div>
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

export default memo(OrderAccept)
