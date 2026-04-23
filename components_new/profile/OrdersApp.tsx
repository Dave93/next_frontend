'use client'

import { FC, memo } from 'react'
import { useUI } from '@components/ui/context'
import { ShoppingCartIcon } from '@heroicons/react/outline'
import { Link } from '../../i18n/navigation'
import Hashids from 'hashids'
import { DateTime } from 'luxon'
import currency from 'currency.js'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'

let webAddress = process.env.NEXT_PUBLIC_API_URL

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

const statusLabels: Record<string, Record<string, string>> = {
  done: { ru: 'Выполнен', uz: 'Bajarildi', en: 'Completed' },
  delivered: { ru: 'Доставлен', uz: 'Yetkazildi', en: 'Delivered' },
  pending: { ru: 'В ожидании', uz: 'Kutilmoqda', en: 'Pending' },
  processing: { ru: 'Обработка', uz: 'Jarayonda', en: 'Processing' },
  cancelled: { ru: 'Отменён', uz: 'Bekor qilindi', en: 'Cancelled' },
  cooked: { ru: 'Готов и ждёт отправки', uz: 'Tayyor', en: 'Ready' },
  cooking: { ru: 'Готовится', uz: 'Tayyorlanmoqda', en: 'Cooking' },
  confirmed: { ru: 'Подтверждён', uz: 'Tasdiqlandi', en: 'Confirmed' },
  delivering: { ru: 'Доставляется', uz: 'Yetkazilmoqda', en: 'Delivering' },
  new: { ru: 'Новый', uz: 'Yangi', en: 'New' },
  in_progress: { ru: 'В процессе', uz: 'Jarayonda', en: 'In progress' },
}

const statusColors: Record<string, string> = {
  done: 'bg-green-100 text-green-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  in_progress: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  cooking: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-blue-100 text-blue-700',
  cooked: 'bg-orange-100 text-orange-700',
  delivering: 'bg-purple-100 text-purple-700',
  new: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

const inlineLabels: Record<string, Record<string, string>> = {
  order: { ru: 'Заказ', uz: 'Buyurtma', en: 'Order' },
  total: { ru: 'Итого', uz: 'Jami', en: 'Total' },
  details: { ru: 'Подробнее', uz: 'Batafsil', en: 'Details' },
  no_orders: {
    ru: 'Заказов пока нет',
    uz: "Buyurtmalar hali yo'q",
    en: 'No orders yet',
  },
  load_more: { ru: 'Загрузить ещё', uz: 'Yana yuklash', en: 'Load more' },
  delivery_address: {
    ru: 'Адрес доставки',
    uz: 'Yetkazish manzili',
    en: 'Delivery address',
  },
  items_count: {
    ru: 'Количество товаров',
    uz: 'Tovarlar soni',
    en: 'Items count',
  },
  order_total: { ru: 'Сумма заказа', uz: 'Buyurtma summasi', en: 'Total' },
}

const OrdersApp: FC = () => {
  const locale = useLocale()
  const { activeCity } = useUI()

  const t = (key: string) =>
    inlineLabels[key]?.[locale] || inlineLabels[key]?.ru || key

  const hashids = new Hashids(
    'order',
    15,
    'abcdefghijklmnopqrstuvwxyz1234567890'
  )

  const { isLoading, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['orders'],
      queryFn: fetchOrders,
      initialPageParam: 1,
      getNextPageParam: (lastPage: any) => {
        return lastPage.current_page === lastPage.last_page
          ? undefined
          : lastPage.current_page + 1
      },
    })

  const getStatusText = (status: string) =>
    statusLabels[status]?.[locale] || statusLabels[status]?.ru || status

  const getStatusColor = (status: string) =>
    statusColors[status] || 'bg-gray-100 text-gray-700'

  const formatPrice = (price: number) =>
    currency(price / 100, {
      pattern: '# !',
      separator: ' ',
      decimal: '.',
      symbol: 'сум',
      precision: 0,
    }).format()

  const formatDate = (dateStr: string) => {
    const dt = DateTime.fromISO(dateStr)
      .setLocale(locale)
      .setZone('Asia/Tashkent')
    return `${dt.toLocaleString(DateTime.DATE_FULL)} в ${dt.toLocaleString(
      DateTime.TIME_SIMPLE
    )}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <svg
          className="animate-spin h-8 w-8"
          style={{ color: '#F9B004' }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    )
  }

  const allOrders = data?.pages.flatMap((page: any) => page.data || []) || []

  return (
    <div className="pb-20 md:pb-5">
      {/* Desktop title */}
      <div className="hidden md:block mx-5 md:mx-0">
        <div className="text-2xl mt-8 mb-5">История заказов</div>
      </div>

      {/* Empty state */}
      {allOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <ShoppingCartIcon className="h-16 w-16 text-gray-300 mb-4" />
          <span className="text-gray-400 text-base">{t('no_orders')}</span>
        </div>
      )}

      {/* Mobile order cards */}
      <div className="md:hidden px-4 pt-2 space-y-3">
        {allOrders.map((order: any) => (
          <Link
            key={order.id}
            href={`/${activeCity?.slug}/order/${hashids.encode(order.id)}`}
            prefetch={false}
            className="block rounded-2xl bg-white p-4 shadow-sm border border-gray-100 active:bg-gray-50"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-base font-bold text-gray-900">
                {t('order')} №{order.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  order?.status
                )}`}
              >
                {getStatusText(order?.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {formatDate(order?.created_at)}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('total')}:</span>
              <span className="text-base font-bold text-gray-900">
                {formatPrice(order?.order_total)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop order cards */}
      <div className="hidden md:block mx-5 md:mx-0">
        {allOrders.map((order: any) => (
          <div
            className="border border-gray-200 p-6 rounded-xl mt-4 hover:shadow-lg transition-shadow duration-200"
            key={order.id}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <Link
                  href={`/${activeCity?.slug}/order/${hashids.encode(order.id)}`}
                  className="text-blue-600 font-semibold text-lg hover:text-blue-700 hover:underline"
                >
                  Заказ № {order.id}
                </Link>
                <div className="text-gray-500 text-sm mt-1">
                  {formatDate(order?.created_at)}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order?.status
                )}`}
              >
                {getStatusText(order?.status)}
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-500 text-sm">
                  {t('delivery_address')}
                </div>
                <div className="text-gray-900 font-medium mt-1">
                  {order?.billing_address}
                  {order.house ? `, д. ${order.house}` : ''}
                  {order.flat ? `, кв. ${order.flat}` : ''}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">{t('items_count')}</div>
                <div className="text-gray-900 font-medium mt-1">
                  {order?.basket?.lines?.length || 0} товаров
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 text-sm">{t('order_total')}</div>
                <div className="text-gray-900 font-bold text-lg mt-1">
                  {formatPrice(order?.order_total)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {order?.terminalData && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {locale === 'uz'
                      ? order?.terminalData.name_uz
                      : locale === 'en'
                      ? order?.terminalData.name_en
                      : order?.terminalData.name}
                  </div>
                )}
              </div>
              <Link
                href={`/${activeCity?.slug}/order/${hashids.encode(order.id)}`}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
              >
                {t('details')}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center mt-5 px-4">
          <button
            onClick={() => fetchNextPage()}
            className="text-white font-semibold flex h-12 items-center justify-center rounded-full w-full md:w-80"
            style={{ backgroundColor: '#F9B004' }}
          >
            {isFetchingNextPage ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              t('load_more')
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(OrdersApp)
