import React, { FC, memo, useEffect, useState } from 'react'
import OrdersItems from '@commerce/data/orders'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
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
              className="border  p-10 rounded-2xl text-xl mt-5"
              key={order.id}
            >
              <Disclosure>
                {({ open }) => (
                  <>
                    <div className="md:flex text-base justify-between border-b pb-8">
                      {open ? (
                        <div className="font-bold text-xl text-secondary">
                          <Link
                            href={`${
                              '/' +
                              activeCity.slug +
                              '/order/' +
                              hashids.encode(order.id)
                            }`}
                            legacyBehavior
                          >
                            <a>
                              {tr('order')} № {order.id}
                            </a>
                          </Link>
                        </div>
                      ) : (
                        <div> № {order.id}</div>
                      )}

                      {!open && (
                        <>
                          <div>
                            {DateTime.fromISO(order?.created_at)
                              .setLocale('ru')
                              .setZone('Asia/Tashkent')
                              .toLocaleString(DateTime.DATETIME_MED)}
                          </div>
                          <div className="w-40">
                            {order?.billing_address}
                            {order.house
                              ? ', ' +
                                tr('house').toLocaleLowerCase() +
                                ': ' +
                                order.house
                              : ''}
                            {order.flat
                              ? ', ' +
                                tr('flat').toLocaleLowerCase() +
                                ': ' +
                                order.flat
                              : ''}
                            {order.entrance
                              ? ', ' +
                                tr('entrance').toLocaleLowerCase() +
                                ': ' +
                                order.entrance
                              : ''}
                            {order.door_code
                              ? ', ' +
                                tr('code_on_doors').toLocaleLowerCase() +
                                ': ' +
                                order.door_code
                              : ''}
                          </div>
                          <div>
                            {tr('prod-count', {
                              count: order?.basket?.lines.length,
                            })}
                          </div>
                          <div>
                            {currency(order?.order_total / 100, {
                              pattern: '# !',
                              separator: ' ',
                              decimal: '.',
                              symbol: 'сум',
                              precision: 0,
                            }).format()}
                          </div>
                        </>
                      )}
                      <div className={`md:ml-56 `}>
                        {tr(`order_status_${order?.status}`)}
                      </div>
                    </div>
                    {order?.basket?.lines.map((pizza: any) => (
                      <Disclosure.Panel
                        className="flex items-center justify-between border-b mt-4 pb-4"
                        key={pizza.id}
                      >
                        <div className="flex items-center">
                          {pizza.child &&
                          pizza.child.length &&
                          pizza.child[0].variant?.product?.id !=
                            pizza?.variant?.product?.box_id ? (
                            pizza.child.length > 1 ? (
                              <div className="h-14 w-40 flex relative">
                                <div className="w-5 absolute left-0">
                                  <div>
                                    <Image
                                      src={
                                        pizza?.variant?.product?.assets?.length
                                          ? `${webAddress}/storage/${pizza?.variant?.product?.assets[0]?.location}/${pizza?.variant?.product?.assets[0]?.filename}`
                                          : '/no_photo.svg'
                                      }
                                      width="40"
                                      height="40"
                                      layout="fixed"
                                      className="rounded-full"
                                      alt="no_photo"
                                    />
                                  </div>
                                </div>
                                {pizza.child.map(
                                  (child: any, index: number) => (
                                    <div
                                      key={`three_child_${index}`}
                                      className="w-5 absolute"
                                      style={{
                                        left: index == 0 ? '0.5rem' : '1.5rem',
                                      }}
                                    >
                                      <Image
                                        src={
                                          child.variant?.product?.assets?.length
                                            ? `${webAddress}/storage/${child.variant?.product?.assets[0]?.location}/${child.variant?.product?.assets[0]?.filename}`
                                            : '/no_photo.svg'
                                        }
                                        width="40"
                                        height="40"
                                        layout="fixed"
                                        className="rounded-full"
                                        alt="no_photo"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="h-28 w-28 flex relative">
                                <div className="w-12 relative overflow-hidden">
                                  <div>
                                    <Image
                                      src={
                                        pizza?.variant?.product?.assets?.length
                                          ? `${webAddress}/storage/${pizza?.variant?.product?.assets[0]?.location}/${pizza?.variant?.product?.assets[0]?.filename}`
                                          : '/no_photo.svg'
                                      }
                                      width="40"
                                      height="40"
                                      layout="fixed"
                                      className="absolute rounded-full"
                                      alt="no_photo"
                                    />
                                  </div>
                                </div>
                                <div className="w-12 relative overflow-hidden">
                                  <div className="absolute right-0">
                                    <Image
                                      src={
                                        pizza?.child[0].variant?.product?.assets
                                          ?.length
                                          ? `${webAddress}/storage/${pizza?.child[0].variant?.product?.assets[0]?.location}/${pizza?.child[0].variant?.product?.assets[0]?.filename}`
                                          : '/no_photo.svg'
                                      }
                                      width="40"
                                      height="40"
                                      layout="fixed"
                                      className="rounded-full"
                                      alt="no_photo"
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          ) : (
                            <div>
                              <Image
                                src={
                                  pizza?.variant?.product?.assets?.length
                                    ? `${webAddress}/storage/${pizza?.variant?.product?.assets[0]?.location}/${pizza?.variant?.product?.assets[0]?.filename}`
                                    : '/no_photo.svg'
                                }
                                width={95}
                                height={95}
                                className="rounded-full w-24"
                                alt="no_photo"
                              />
                            </div>
                          )}
                          <div className="ml-5">
                            <div className="text-xl font-bold">
                              {pizza.child && pizza.child.length > 1
                                ? `${
                                    pizza?.variant?.product?.attribute_data
                                      ?.name[channelName][locale || 'ru']
                                  } + ${pizza?.child
                                    .filter(
                                      (v: any) =>
                                        pizza?.variant?.product?.box_id !=
                                        v?.variant?.product?.id
                                    )
                                    .map(
                                      (v: any) =>
                                        v?.variant?.product?.attribute_data
                                          ?.name[channelName][locale || 'ru']
                                    )
                                    .join(' + ')}`
                                : pizza?.variant?.product?.attribute_data?.name[
                                    channelName
                                  ][locale || 'ru']}{' '}
                            </div>
                          </div>
                        </div>
                        <div>
                          {pizza.child && pizza.child.length
                            ? (pizza.total > 0 ? pizza.quantity + ' X ' : '') +
                              currency(
                                +pizza.total +
                                  +pizza.child.reduce(
                                    (previousValue: any, currentValue: any) =>
                                      +previousValue + +currentValue.total,
                                    0
                                  ),
                                {
                                  pattern: '# !',
                                  separator: ' ',
                                  decimal: '.',
                                  symbol: 'сум',
                                  precision: 0,
                                }
                              ).format()
                            : (pizza.total > 0 ? pizza.quantity + ' X ' : '') +
                              currency(pizza.total * pizza.quantity, {
                                pattern: '# !',
                                separator: ' ',
                                decimal: '.',
                                symbol: 'сум',
                                precision: 0,
                              }).format()}
                        </div>
                      </Disclosure.Panel>
                    ))}
                    {open && (
                      <>
                        <div className="flex items-center justify-between border-b pt-7 pb-7">
                          <div>{tr('order_price')}</div>
                          <div className="font-bold">
                            {currency(order?.order_total / 100, {
                              pattern: '# !',
                              separator: ' ',
                              decimal: '.',
                              symbol: 'сум',
                              precision: 0,
                            }).format()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-b pt-7 pb-7 space-x-6 text-right">
                          <div>{tr('order_address')}</div>
                          <div>
                            {order?.billing_address}
                            {order.house
                              ? ', ' +
                                tr('house').toLocaleLowerCase() +
                                ': ' +
                                order.house
                              : ''}
                            {order.flat
                              ? ', ' +
                                tr('flat').toLocaleLowerCase() +
                                ': ' +
                                order.flat
                              : ''}
                            {order.entrance
                              ? ', ' +
                                tr('entrance').toLocaleLowerCase() +
                                ': ' +
                                order.entrance
                              : ''}
                            {order.door_code
                              ? ', ' +
                                tr('code_on_doors').toLocaleLowerCase() +
                                ': ' +
                                order.door_code
                              : ''}
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-b pt-7 pb-7 space-x-6 text-right">
                          <div>{tr('branch')}</div>
                          <div>
                            {locale == 'uz'
                              ? order?.terminalData.name_uz
                              : locale == 'ru'
                              ? order?.terminalData.name
                              : locale == 'en'
                              ? order?.terminalData.name_en
                              : ''}
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-b pt-7 pb-7">
                          <div>{tr('order_time')}</div>
                          <div>
                            {DateTime.fromISO(order?.created_at)
                              .setLocale('ru')
                              .setZone('Asia/Tashkent')
                              .toLocaleString(DateTime.DATETIME_MED)}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between mt-8">
                      <Disclosure.Button className="border flex focus:outline-none items-center justify-between px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-gray-100 text-gray-400">
                        <div className="ml-auto">{tr('order_detail')}</div>
                        <ChevronDownIcon
                          className={`${
                            open ? 'transform rotate-180' : ''
                          } w-6 h-6 text-purple-500 ml-auto`}
                        />
                      </Disclosure.Button>
                    </div>
                  </>
                )}
              </Disclosure>
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
