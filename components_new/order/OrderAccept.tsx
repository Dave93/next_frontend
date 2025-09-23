import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, { memo, FC, useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon, TruckIcon } from '@heroicons/react/solid'
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

axios.defaults.withCredentials = true

type OrderDetailProps = {
  order: any
  orderStatuses: any
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const OrderAccept: FC<OrderDetailProps> = ({ order, orderStatuses }) => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewsData, setReviewsData] = useState([])
  const { user, activeCity } = useUI()
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

  const fetchReviews = async () => {
    const { data } = await axios.get(
      `${webAddress}/api/reviews?order_id=${order.id}`
    )
    setReviewsData(data.data)
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    await setCredentials()
    let values = { ...getValues() }
    const { data: reviewData } = await axios.post(`${webAddress}/api/reviews`, {
      name: user?.user?.name,
      phone: user?.user?.phone,
      user_id: user?.user?.id,
      order_id: order.id,
      text: values.review,
    })
    if (reviewData.success) {
      reset()

      await fetchReviews()
    }
    setIsSubmitting(false)
  }

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const currentStatusIndex = Object.keys(orderStatuses).findIndex(
    (status: string) => status == order.status
  )

  // Check if order can be tracked
  const canTrackOrder = order?.delivery_type === 'deliver' &&
    order?.track_id &&
    (order?.status === 'cooked' || order?.status === 'delivering')

  useEffect(() => {
    getChannel()
    fetchReviews()
  }, [])

  return (
    <div>
      <div className="md:p-10 p-5 rounded-2xl text-xl mt-5 bg-white">
        <div className=" flex justify-between items-center">
          <div>
            <div className="text-base text-gray-500">
              {tr('order_is_accepted')}
            </div>
            <div className="text-3xl  font-bold">№ {order.id}</div>
          </div>

          <div className="text-center">
            <div className="text-base font-bold text-gray-500 mb-2">
              {tr('order_status')}
            </div>
            {Object.keys(orderStatuses).map(
              (status: any, key) =>
                key == currentStatusIndex && (
                  <div key={status} className="text-center">
                    <div className="bg-yellow rounded-full px-2 text-white">
                      {tr(`order_status_${status}`)}
                    </div>
                  </div>
                )
            )}
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
        {canTrackOrder && (
          <div className="mt-5 pt-5 border-t">
            <div className="w-full md:w-auto">
              <Link
                prefetch={false}
                href={`/${activeCity.slug}/track/${order.track_id}`}
                legacyBehavior
              >
                <a className="w-full md:w-auto">
                  <div className="text-sm rounded-lg py-2 px-7 text-white bg-yellow cursor-pointer w-full md:w-auto text-center">
                    <TruckIcon className="inline-block w-5 h-5 mr-2" />
                    {tr('tracking_page_title') || 'Отследить заказ'}
                  </div>
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="md:p-10 p-5 rounded-2xl text-xl mt-5 bg-white">
        <div className="text-lg mb-7 font-bold">{tr('delivery_address')}</div>
        <div>
          {order?.billing_address}
          {order.house
            ? ', ' + tr('house').toLocaleLowerCase() + ': ' + order.house
            : ''}
          {order.flat
            ? ', ' + tr('flat').toLocaleLowerCase() + ': ' + order.flat
            : ''}
          {order.entrance
            ? ', ' + tr('entrance').toLocaleLowerCase() + ': ' + order.entrance
            : ''}
          {order.door_code
            ? ', ' +
            tr('code_on_doors').toLocaleLowerCase() +
            ': ' +
            order.door_code
            : ''}
        </div>
        <div>
          <div className="text-lg mb-7 font-bold mt-7">
            {tr('order_time_of_delivery')}
          </div>
          <div>
            {order.delivery_schedule == 'now'
              ? tr('hurry_up')
              : order?.delivery_time}
          </div>
        </div>
      </div>
      <div className="md:p-10 p-5 rounded-2xl text-xl mt-5 bg-white">
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
                          alt=""
                        />
                      </div>
                    </div>
                    {pizza.child.map((child: any, index: number) => (
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
                          alt=""
                        />
                      </div>
                    ))}
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
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="w-12 relative overflow-hidden">
                      <div className="absolute right-0">
                        <Image
                          src={
                            pizza?.child[0].variant?.product?.assets?.length
                              ? `${webAddress}/storage/${pizza?.child[0].variant?.product?.assets[0]?.location}/${pizza?.child[0].variant?.product?.assets[0]?.filename}`
                              : '/no_photo.svg'
                          }
                          width="40"
                          height="40"
                          layout="fixed"
                          className="rounded-full"
                          alt=""
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
                    alt=""
                  />
                </div>
              )}
              <div className="ml-5">
                <div className="text-xl font-bold">
                  {pizza.child && pizza.child.length > 1
                    ? `${pizza?.variant?.product?.attribute_data?.name[
                    channelName
                    ][locale || 'ru']
                    } + ${pizza?.child
                      .filter(
                        (v: any) =>
                          pizza?.variant?.product?.box_id !=
                          v?.variant?.product?.id
                      )
                      .map(
                        (v: any) =>
                          v?.variant?.product?.attribute_data?.name[
                          channelName
                          ][locale || 'ru']
                      )
                      .join(' + ')}`
                    : pizza?.variant?.product?.attribute_data?.name[
                    channelName
                    ][locale || 'ru']}{' '}
                  {pizza.bonus_id && (
                    <span className="text-yellow">({tr('bonus')})</span>
                  )}
                  {pizza.sale_id && (
                    <span className="text-yellow">({tr('sale_label')})</span>
                  )}
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
          </div>
        ))}
      </div>
      <div className="md:p-10 p-5 rounded-2xl text-xl mt-5 bg-white mb-5">
        {reviewsData && reviewsData.length > 0 && (
          <div className="mt-2 mb-4">
            <div className="text-lg mb-4 font-bold">{tr('your_reviews')}</div>
            <div className="flex space-y-3 flex-col">
              {reviewsData.map((review: any) => (
                <div className="relative md:w-1/3 text-sm px-8 py-10 shadow-lg rounded-2xl border">
                  <div className="absolute top-2 left-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-indigo-200 fill-current w-7 h-7 md:w-7 md:h-7"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144C8.97 4.222 8.737 4.278 8.472 4.345c-.271.05-.56.187-.882.312C7.272 4.799 6.904 4.895 6.562 5.123c-.344.218-.741.4-1.091.692C5.132 6.116 4.723 6.377 4.421 6.76c-.33.358-.656.734-.909 1.162C3.219 8.33 3.02 8.778 2.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C2.535 17.474 4.338 19 6.5 19c2.485 0 4.5-2.015 4.5-4.5S8.985 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L20.758 4.03c0 0-.218.052-.597.144-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.317.143-.686.238-1.028.467-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162C14.219 8.33 14.02 8.778 13.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C13.535 17.474 15.338 19 17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10z" />
                    </svg>
                  </div>
                  <div>{review.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="text-lg mb-7 font-bold">
            {tr('waiting_your_feedback')}
          </div>
          <div className="flex mt-3 md:w-96 h-28">
            <div className="w-full">
              <textarea
                {...register('review')}
                className="md:w-96 w-full h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none text-xs"
                placeholder={tr('order_review_placeholder')}
              ></textarea>
            </div>
          </div>
          <button className="bg-yellow rounded-full flex items-center md:w-40 w-full justify-evenly py-2 mt-10 text-white">
            {isSubmitting ? (
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
              <>{tr('send')}</>
            )}
          </button>
        </form>
        <div className="flex justify-end mt-8">
          {/* <button className="text-xl text-gray-500 bg-gray-100 flex h-12 items-center  rounded-full w-80 justify-evenly">
            <img src="/left.png" />
            <div>{tr('cancel_the_order')}</div>
          </button> */}
          <button
            className="text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full md:w-80 w-full"
            onClick={() => router.push(`/${activeCity.slug}`)}
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
