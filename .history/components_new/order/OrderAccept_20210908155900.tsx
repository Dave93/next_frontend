import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, { memo, FC, useState, useEffect } from 'react'
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

type OrderDetailProps = {
  order: any
  orderStatuses: any
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const OrderAccept: FC<OrderDetailProps> = ({ order, orderStatuses }) => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale } = router
  const orderId = router.query.id
  type FormData = {
    review: string
  }
  const { register, handleSubmit, reset, watch, formState, getValues } =
    useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        review: '',
      },
    })
  const [channelName, setChannelName] = useState('chopar')

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const currentStatusIndex = Object.keys(orderStatuses).findIndex(
    (status: string) => status == order.status
  )

  useEffect(() => {
    getChannel()
  }, [])

  return (
    <div>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className=" flex justify-between">
          <div>
            <div className="text-base text-gray-500 mb-2">
              {tr('order_is_accepted')}
            </div>
            <div className="text-3xl mb-7 font-bold">№ {order.id}</div>
          </div>
          <div>
            <div className="text-base text-gray-500 mb-2 text-right">
              {tr('order_time')}
            </div>
            <div className="text-base font-bold">
              {DateTime.fromISO(order?.created_at)
                .setLocale(`${locale == 'uz' ? 'uz' : 'ru'}`)
                .setZone('Asia/Tashkent')
                .toLocaleString(DateTime.DATETIME_MED)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-10 ">
          {Object.keys(orderStatuses).map((status: any, key) => (
            <div key={status} className="flex items-center">
              <div className="h-24 relative flex flex-col items-center top-5 w-12">
                {key <= currentStatusIndex ? (
                  <img src="/assets/status.png" />
                ) : (
                  <div className="border-2 h-12 rounded-full w-12"></div>
                )}
                <div
                  className={`bottom-0 leading-4 mt-2 text-base text-center ${
                    key <= currentStatusIndex ? 'text-yellow' : 'text-gray-400'
                  }`}
                >
                  {tr(`order_status_${status}`)}
                </div>
              </div>
              {key != Object.keys(orderStatuses).length - 1 && (
                <div
                  className={`border rounded-full w-24 pr-24 ${
                    key < currentStatusIndex ? 'border-yellow' : ''
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className="text-lg mb-7 font-bold">{tr('delivery_address')}</div>
        <div>{order?.billing_address}</div>
      </div>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className="text-lg mb-10 font-bold">
          {order?.basket?.lines.length} {tr('product')}{' '}
          {locale == 'ru' ? 'на' : ''}{' '}
          {currency(order?.order_total / 100, {
            pattern: '# !',
            separator: ' ',
            decimal: '.',
            symbol: `${tr('sum')}`,
            precision: 0,
          }).format()}
        </div>
        {order?.basket?.lines.map((pizza: any) => (
          <div
            className="flex items-center justify-between border-b mt-4 pb-4"
            key={pizza.id}
          >
            <div className="flex items-center">
              <Image
                className="w-24"
                src={`${webAddress}/storage/${pizza?.variant?.product?.assets[0]?.location}/${pizza?.variant?.product?.assets[0]?.filename}`}
                width={70}
                height={70}
              />
              <div className="ml-5">
                <div className="text-xl font-bold">
                  {
                    pizza?.variant?.product?.attribute_data?.name[channelName][
                      locale || 'ru'
                    ]
                  }
                </div>
              </div>
            </div>
            <div>
              {currency(pizza?.total, {
                pattern: '# !',
                separator: ' ',
                decimal: '.',
                symbol: `${tr('sum')}`,
                precision: 0,
              }).format()}
            </div>
          </div>
        ))}
      </div>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className="text-lg mb-7 font-bold">
          {tr('waiting_your_feedback')}
        </div>
        <div className="flex mt-3 w-96 h-28">
          <div>
            <textarea
              {...register('review')}
              className="w-96 h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none text-xs"
              placeholder={tr('only_the_courier_will_see_your_comment')}
            ></textarea>
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <button className="text-xl text-gray-500 bg-gray-100 flex h-12 items-center  rounded-full w-80 justify-evenly">
            <img src="/left.png" />
            <div>{tr('cancel_the_order')}</div>
          </button>
          <button
            className="text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full w-80"
            onClick={() => router.push('/')}
          >
            <div>{tr('to_main')}</div>
            <img src="/right.png" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(OrderAccept)
