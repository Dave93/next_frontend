import React, { FC, memo, useEffect, useState } from 'react'
import OrdersItems from '@commerce/data/orders'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import { ShoppingCartIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import Hashids from 'hashids'
import { DateTime } from 'luxon'
import currency from 'currency.js'
import defaultChannel from '@lib/defaultChannel'
import Image from 'next/image'
import getConfig from 'next/config'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useInfiniteQuery } from 'react-query'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const fetchOrders = async ({ pageParam = 1 }) => {
  const otpToken = Cookies.get('opt_token')
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
  const { data } = await axios.get(
    `${webAddress}/api/my-orders?page=${pageParam}`,
    {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    }
  )
  return data
}

const Orders: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale } = router
  const { user, activeCity } = useUI()

  const hashids = new Hashids(
    'order',
    15,
    'abcdefghijklmnopqrstuvwxyz1234567890'
  )
  const [channelName, setChannelName] = useState('chopar')

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const {
    isLoading,
    isError,
    error,
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery(['orders'], fetchOrders, {
    getNextPageParam: (lastPage, pages) => {
      return lastPage.current_page == lastPage.last_page
        ? undefined
        : lastPage.current_page + 1
    },
  })

  useEffect(() => {
    getChannel()
  }, [])
  return (
    <div className="mx-5 md:mx-0 mb-5">
      <div className="text-2xl mt-8 mb-5">{tr('order_myOrders')}</div>
      {!isLoading && data && data.pages.length === 0 && (
        <div className="flex justify-around">
          <div className="space-y-4 text-center">
            <ShoppingCartIcon className="h-48 w-48 text-yellow mx-auto" />
            <span className="font-bold uppercase text-5xl">
              Заказы отсутсвуют
            </span>
          </div>
        </div>
      )}
      {!isLoading &&
        data &&
        data.pages.map((orders: any) =>
          orders.data.map((order: any) => (
            <div
              className="border border-gray-200 p-6 rounded-xl mt-4 hover:shadow-lg transition-shadow duration-200"
              key={order.id}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Link
                    href={`${'/' +
                      activeCity.slug +
                      '/order/' +
                      hashids.encode(order.id)
                      }`}
                    legacyBehavior
                  >
                    <a className="text-blue-600 font-semibold text-lg hover:text-blue-700 hover:underline">
                      Заказ № {order.id}
                    </a>
                  </Link>
                  <div className="text-gray-500 text-sm mt-1">
                    {DateTime.fromISO(order?.created_at)
                      .setLocale('ru')
                      .setZone('Asia/Tashkent')
                      .toLocaleString(DateTime.DATE_FULL)} в {DateTime.fromISO(order?.created_at)
                        .setLocale('ru')
                        .setZone('Asia/Tashkent')
                        .toLocaleString(DateTime.TIME_SIMPLE)}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${order?.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order?.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        order?.status === 'new' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                  }`}>
                  {tr(`order_status_${order?.status}`)}
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">Адрес доставки</div>
                  <div className="text-gray-900 font-medium mt-1">
                    {order?.billing_address}
                    {order.house ? `, д. ${order.house}` : ''}
                    {order.flat ? `, кв. ${order.flat}` : ''}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 text-sm">Количество товаров</div>
                  <div className="text-gray-900 font-medium mt-1">
                    {tr('prod-count', {
                      count: order?.basket?.lines?.length || 0,
                    })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-gray-500 text-sm">Сумма заказа</div>
                  <div className="text-gray-900 font-bold text-lg mt-1">
                    {currency(order?.order_total / 100, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: 'сум',
                      precision: 0,
                    }).format()}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {order?.terminalData && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {locale == 'uz'
                        ? order?.terminalData.name_uz
                        : locale == 'ru'
                          ? order?.terminalData.name
                          : locale == 'en'
                            ? order?.terminalData.name_en
                            : order?.terminalData.name}
                    </div>
                  )}
                </div>

                <Link
                  href={`${'/' +
                    activeCity.slug +
                    '/order/' +
                    hashids.encode(order.id)
                    }`}
                  legacyBehavior
                >
                  <a className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                    Подробнее
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </Link>
              </div>
            </div>
          ))
        )}
      {hasNextPage && (
        <div className="flex justify-around mt-5">
          <button
            onClick={() => fetchNextPage()}
            className="md:text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full md:w-80 w-full"
          >
            {isFetchingNextPage ? (
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
              tr('load_more')
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(Orders)
