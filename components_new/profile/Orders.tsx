import React, { FC, memo } from 'react'
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

type OrdersListProps = {
  orders: any[]
}

const Orders: FC<OrdersListProps> = ({ orders }) => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { user } = useUI()

  const hashids = new Hashids(
    'order',
    15,
    'abcdefghijklmnopqrstuvwxyz1234567890'
  )

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
                        <div className="w-40">{order?.billing_address}</div>
                        <div>
                          {tr('prod-count', { count: order?.lines.length })}
                        </div>
                        <div>
                          {currency(order?.order_total / 100, {
                            pattern: '# !',
                            separator: ' ',
                            decimal: '.',
                            symbol: 'сўм',
                            precision: 0,
                          }).format()}
                        </div>
                      </>
                    )}
                    <div className={`ml-56 `}>
                      {tr(`order_status_${order?.status}`)}
                    </div>
                  </div>
                  {/* {item.items.map((pizza) => (
                    <Disclosure.Panel className="flex items-center justify-between border-b mt-4 pb-4">
                      <div className="flex items-center">
                        <img className="w-24" src={pizza.img} />
                        <div className="ml-5">
                          <div className="text-xl font-bold">{pizza.name}</div>
                          <div className="text-gray-400 text-xs">
                            {pizza.type}
                          </div>
                        </div>
                      </div>
                      <div>{pizza.price}</div>
                    </Disclosure.Panel>
                  ))} */}
                  {open && (
                    <>
                      <div className="flex items-center justify-between border-b pt-7 pb-7">
                        <div>{tr('order_price')}</div>
                        <div className="font-bold">
                          {currency(order?.order_total / 100, {
                            pattern: '# !',
                            separator: ' ',
                            decimal: '.',
                            symbol: 'сўм',
                            precision: 0,
                          }).format()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-b pt-7 pb-7">
                        <div>{tr('order_address')}</div>
                        <div>{order?.billing_address}</div>
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
