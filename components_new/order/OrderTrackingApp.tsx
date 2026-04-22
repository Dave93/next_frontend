'use client'

import { useUI } from '@components/ui/context'
import { FC, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import axios from 'axios'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

axios.defaults.withCredentials = true

type YMapsMapProps = {
  mapCenter: number[]
  placeMarks: any[]
  coords: any[]
  points: any
  courier: any
}

// Wrap YMaps map components in dynamic to avoid SSR issues
const YMapsMap = dynamic(
  () => import('./OrderTrackingMap').then((mod) => mod.default),
  { ssr: false }
) as ComponentType<YMapsMapProps>

type OrderTrackingDetailProps = {
  orderId: any
}

let webAddress = process.env.NEXT_PUBLIC_API_URL

const OrderTrackingApp: FC<OrderTrackingDetailProps> = ({ orderId }) => {
  const { openSignInModal } = useUI()

  const [shouldFetch, setShouldFetch] = useState(true)
  const { data, isError } = useQuery({
    queryKey: ['track_order'],
    queryFn: async () => {
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
    refetchInterval: shouldFetch ? 5000 : false,
    refetchOnMount: true,
    enabled: shouldFetch,
  })

  const [mapCenter, setMapCenter] = useState([] as number[])
  const [placeMarks, setPlaceMarks] = useState([] as any[])
  const [coords, setCoords] = useState([] as any[])
  const [points, setPoints] = useState<any | null>(null)

  useEffect(() => {
    if (data?.success === false) {
      setShouldFetch(false)
    }

    if (data?.success === true) {
      setMapCenter(Object.values(data?.data).map((i: any) => +i))
      setPlaceMarks([
        {
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
              <span className="mr-3">Отслеживание заказа</span>
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
                      <strong className="font-bold">Ошибка: </strong>
                      <span className="block sm:inline">
                        Пользователь не авторизован
                      </span>
                    </div>
                    <button
                      className="text-xl text-white bg-green-500 rounded-2xl mt-20 md:w-max m-auto py-5 px-16 cursor-pointer text-center mx-5 md:mx-auto"
                      onClick={openSignInModal}
                    >
                      <div>Войти</div>
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
                    <strong className="font-bold">Ошибка: </strong>
                    <span className="block sm:inline">{data.message}</span>
                  </div>
                  <div
                    className="text-sm md:rounded-lg rounded-full py-2 px-7 mt-5 text-white bg-green-500 cursor-pointer"
                    onClick={() => setShouldFetch(true)}
                  >
                    Обновить
                  </div>
                </div>
              )}
            </>
          )}
          {data?.success === true && (
            <YMapsMap
              mapCenter={mapCenter}
              placeMarks={placeMarks}
              coords={coords}
              points={points}
              courier={data?.courier}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default OrderTrackingApp
