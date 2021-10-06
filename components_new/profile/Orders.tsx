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

type OrdersListProps = {
  orders: any[]
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const Orders: FC<OrdersListProps> = ({ orders }) => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale } = router
  const { user } = useUI()

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
  useEffect(() => {
    getChannel()
  }, [])
  return (
    <div>
      <div className="text-2xl mt-8 mb-5">{tr('order_myOrders')}</div>
      {orders.length === 0 && (
        <div className="flex justify-around">
          <div className="space-y-4 text-center">
            <ShoppingCartIcon className="h-48 w-48 text-yellow mx-auto" />
            <span className="font-bold uppercase text-5xl">
              Заказы отсутсвуют
            </span>
          </div>
        </div>
      )}
      {orders.length &&
        orders.map((order: any) => (
          <div className="border  p-10 rounded-2xl text-xl mt-5" key={order.id}>
            <Disclosure>
              {({ open }) => (
                <>
                  <div className="flex  text-base justify-between border-b pb-8">
                    {open ? (
                      <div className="font-bold text-xl">
                        <Link href={`${'/order/' + hashids.encode(order.id)}`}>
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
                    <div className={`ml-56 `}>
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
                          <div className="h-24 w-24 flex relative">
                            <div className="w-12 relative overflow-hidden">
                              <div>
                                <Image
                                  src={
                                    pizza?.variant?.product?.assets?.length
                                      ? `${webAddress}/storage/${pizza?.variant?.product?.assets[0]?.location}/${pizza?.variant?.product?.assets[0]?.filename}`
                                      : '/no_photo.svg'
                                  }
                                  width="95"
                                  height="95"
                                  layout="fixed"
                                  className="absolute rounded-full"
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
                                  width="95"
                                  height="95"
                                  layout="fixed"
                                  className="rounded-full"
                                />
                              </div>
                            </div>
                          </div>
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
                            />
                          </div>
                        )}
                        <div className="ml-5">
                          <div className="text-xl font-bold">
                            {pizza.child && pizza.child.length
                              ? `${
                                  pizza?.variant?.product?.attribute_data?.name[
                                    channelName
                                  ][locale || 'ru']
                                } + ${
                                  pizza?.child[0].variant?.product
                                    ?.attribute_data?.name[channelName][
                                    locale || 'ru'
                                  ]
                                }`
                              : pizza?.variant?.product?.attribute_data?.name[
                                  channelName
                                ][locale || 'ru']}
                          </div>
                        </div>
                      </div>
                      <div>
                        {pizza.child && pizza.child.length
                          ? currency(
                              (+pizza.total + +pizza.child[0].total) *
                                pizza.quantity,
                              {
                                pattern: '# !',
                                separator: ' ',
                                decimal: '.',
                                symbol: 'сум',
                                precision: 0,
                              }
                            ).format()
                          : currency(pizza.total * pizza.quantity, {
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
                            : order?.terminalData.name}
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
                    {/* <Disclosure>
                      <Disclosure.Button className="border flex focus:outline-none items-center justify-center px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-yellow text-white">
                        <div>{tr('order_repeat')}</div>
                      </Disclosure.Button>
                    </Disclosure> */}
                  </div>
                </>
              )}
            </Disclosure>
          </div>
        ))}
    </div>
  )
}

export default memo(Orders)
