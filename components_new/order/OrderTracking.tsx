import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, { memo, FC, useState, useEffect, useMemo, useRef } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import OrdersItems from '@commerce/data/orders'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import currency from 'currency.js'
import Image from 'next/image'
import getConfig from 'next/config'
import defaultChannel from '@lib/defaultChannel'
import { DateTime } from 'luxon'
import Cookies from 'js-cookie'
import axios from 'axios'
import { log } from 'console'
import { useQuery } from 'react-query'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
} from 'react-yandex-maps'

axios.defaults.withCredentials = true

type OrderTrackingDetailProps = {
  orderId: any
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const OrderTracking: FC<OrderTrackingDetailProps> = ({ orderId }) => {
  const map = useRef<any>(null)
  const { t: tr } = useTranslation('common')
  const { openSignInModal } = useUI()
  const router = useRouter()

  const [shouldFetch, setShouldFetch] = useState(true)
  const { data, isLoading, isError } = useQuery(
    'track_order',
    async () => {
      const { data } = await axios.get(
        `${webAddress}/api/orders/track/?id=${orderId}&new=true`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('opt_token')}`,
          },
        }
      )
      return data
    },
    {
      refetchInterval: shouldFetch ? 5000 : false,
      refetchOnMount: true,
      enabled: shouldFetch,
    }
  )

  const [mapCenter, setMapCenter] = useState([] as number[])
  const [placeMarks, setPlaceMarks] = useState([] as any[])
  const [coords, setCoords] = useState([] as any[])
  const [points, setPoints] = useState<any | null>(null)

  const mapState = useMemo<MapState>(() => {
    const baseState: MapStateBase = {
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
    }
    const mapStateCenter: MapStateCenter = {
      center: mapCenter || [],
      zoom: 17,
    }

    const res: MapState = Object.assign({}, baseState, mapStateCenter)
    return res
  }, [mapCenter])

  useEffect(() => {
    if (data?.success === false) {
      setShouldFetch(false)
    }

    if (data?.success === true) {
      setMapCenter(Object.values(data?.data).map((i: any) => +i))
      setPlaceMarks([
        {
          // random key
          key: Math.ceil(Math.random() * 100004),
          location: [...Object.values(data?.data[0]).map((i: any) => +i)],
        },
      ])
      setCoords(data?.data || [])
      setPoints({
        ...data,
      })
    }
  }, [data])

  if (isError) {
    return <div>Error fetching data</div>
  }

  return (
    <div>
      <header className="bg-white shadow mt-10">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="w-full text-gray-600 flex md:items-center uppercase justify-around text-lg">
              <span className="mr-3">{tr('tracking_page_title')}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto mt-10 bg-white p-10 rounded-lg shadow">
        <div className="md:flex md:items-center justify-around">
          {data?.success === false && (
            <>
              {data?.message === 'user_not_found' ? (
                <>
                  <div className="text-center">
                    <h1 className="text-3xl font-semibold text-gray-700"></h1>
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative"
                      role="alert"
                    >
                      <strong className="font-bold">
                        {tr('error_label')}:{' '}
                      </strong>
                      <span className="block sm:inline">
                        {tr('user_not_signed')}
                      </span>
                    </div>
                    <button className="text-xl text-white bg-green-500 rounded-2xl mt-20 md:w-max m-auto py-5 px-16 cursor-pointer text-center mx-5 md:mx-auto">
                      <div>{tr('signIn')}</div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <h1 className="text-3xl font-semibold text-gray-700"></h1>
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <strong className="font-bold">{tr('error_label')}: </strong>
                    <span className="block sm:inline">{tr(data.message)}</span>
                  </div>
                  <div
                    className="text-sm md:rounded-lg rounded-full py-2 px-7 mt-5 text-white bg-green-500 cursor-pointer"
                    onClick={() => setShouldFetch(true)}
                  >
                    {tr('refresh')}
                  </div>
                </div>
              )}
            </>
          )}
          {data?.success === true && (
            <>
              <div className="relative">
                <YMaps
                  query={{
                    lang: 'ru_RU',
                    load: 'package.full',
                    coordorder: 'latlong',
                  }}
                >
                  <div className="relative">
                    <Map
                      state={mapState}
                      width={`${window.innerWidth < 768 ? '400px' : '1152px'}`}
                      height={`${window.innerWidth < 768 ? '200px' : '530px'}`}
                      modules={[
                        'control.ZoomControl',
                        'control.FullscreenControl',
                        'control.GeolocationControl',
                        'geoQuery',
                      ]}
                      instanceRef={(ref) => (map.current = ref)}
                      onLoad={(ymaps) => {
                        setTimeout(() => {
                          if (coords?.length > 0) {
                            var mapPoints: any[] = coords.map((point) => [
                              point.latitude,
                              point.longitude,
                            ])
                            var polyline = new ymaps.Polyline(
                              mapPoints,
                              {
                                // hintContent: status_name,
                              },
                              {
                                // draggable: true,
                                strokeColor: '#5b6ffa',
                                strokeWidth: 5,
                                // Первой цифрой задаем длину штриха. Второй — длину разрыва.
                                // strokeStyle: "1 5",
                              }
                            )
                            // Добавляем линию на карту.
                            map.current.geoObjects.add(polyline)
                          }
                        }, 300)
                        var placemark = new ymaps.Placemark(
                          [
                            points?.from_location.lat,
                            points?.from_location.lon,
                          ],
                          {
                            hintContent: 'Адрес отправления',
                            iconContent: 'A',
                          },
                          {
                            // Задаем стиль метки (метка в виде круга).
                            preset: 'islands#blueCircleIcon',
                          }
                        )
                        map.current.geoObjects.add(placemark)

                        placemark = new ymaps.Placemark(
                          [points?.to_location.lat, points?.to_location.lon],
                          {
                            hintContent: 'Адрес клиента',
                            iconContent: 'B',
                          },
                          {
                            // Задаем стиль метки (метка в виде круга).
                            preset: 'islands#darkGreenCircleIcon',
                          }
                        )
                        map.current.geoObjects.add(placemark)
                        let bounds = map.current.geoObjects.getBounds()
                        // Применяем область показа к карте
                        map.current.setBounds(bounds)
                      }}
                    >
                      {placeMarks.map((i) => (
                        <Placemark
                          modules={['geoObject.addon.balloon']}
                          defaultGeometry={i.location}
                          geomerty={i.location}
                          key={`placemark-${i.key}`}
                          defaultOptions={{
                            iconLayout: 'default#image',
                            iconImageHref: '/map_placemark-courier.png',
                            iconImageSize: [35, 35],
                            iconImageOffset: [-25, -45],
                          }}
                        />
                      ))}
                    </Map>
                  </div>
                </YMaps>
                {data?.courier && (
                  <div className="bg-white border-2 border-yellow text-gray-700 px-4 py-3 shadow-lg rounded-md absolute bottom-4 right-4">
                    <h3 className="text-xl font-medium mb-2 text-center uppercase">
                      Курьер
                    </h3>
                    <div className="flex items-center">
                      <p className="text-md">
                        {data?.courier.last_name} {data?.courier.first_name}
                      </p>
                    </div>
                    <div className="flex items-center mt-2 justify-around">
                      <p className="text-md">
                        <a href={`tel:${data?.courier.phone}`}>
                          {data?.courier.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default OrderTracking
