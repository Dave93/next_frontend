import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, { memo, FC } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import OrdersItems from '@commerce/data/orders'
import Link from 'next/link'
import { useForm } from 'react-hook-form'

const OrderAccept: FC = () => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const orderId = router.query.id

  const { user } = useUI()
  let items = OrdersItems.map((item) => {
    return {
      ...item,
      name: tr(item.statusCode),
    }
  })

  const currentOrder = items.find((item: any) => item.id == orderId)
  console.log(currentOrder)
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

  return (
    <div>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className=" flex justify-between">
          <div>
            <div className="text-base text-gray-500 mb-2">Заказ принят!</div>
            <div className="text-3xl mb-7 font-bold">№ 433</div>
          </div>
          <div>
            <div className="text-base text-gray-500 mb-2 text-right">
              Время заказа
            </div>
            <div className="text-base font-bold">{currentOrder?.date}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-10 ">
          <div className="h-24 relative flex flex-col items-center top-5 w-12">
            <img src="/assets/status.png" />
            <div className="bottom-0 leading-4 mt-2 text-base text-center text-yellow">
              Заявка принята
            </div>
          </div>
          <div className="border-2 border-yellow rounded-full w-48"></div>
          <div className="h-24 relative flex flex-col items-center top-5 w-12">
            <img src="/assets/status.png" />
            <div className="bottom-0 leading-4 mt-2 text-base text-center text-yellow">
              Обработка заказа
            </div>
          </div>
          <div className="border-2 rounded-full w-48"></div>
          <div className="flex flex-col h-24 items-center relative top-5 w-12">
            <div className="border-2 h-12 rounded-full w-12"></div>
            <div className="bottom-0 leading-4 mt-2 text-base text-center text-gray-400">
              Заказ готовится
            </div>
          </div>
          <div className="border-2 rounded-full w-48"></div>
          <div className="flex flex-col h-24 items-center relative top-5 w-12">
            <div className="border-2 h-12 rounded-full w-12"></div>
            <div className="bottom-0 leading-4 mt-2 text-base text-center text-gray-400">
              Курьер выехал
            </div>
          </div>
          <div className="border-2 rounded-full w-48"></div>
          <div className="flex flex-col h-24 items-center relative top-5 w-12">
            <div className="border-2 h-12 rounded-full w-12"></div>
            <div className="bottom-0 leading-4 mt-2 text-base text-center text-gray-400">
              Доставлено
            </div>
          </div>
        </div>
      </div>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className="text-lg mb-7 font-bold">Адрес доставки</div>
        <div>{currentOrder?.address}</div>
      </div>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className="text-lg mb-10 font-bold">
          {currentOrder?.items.length} товара на {currentOrder?.totalPrice}
        </div>
        {currentOrder?.items.map((pizza, key) => (
          <div
            className="flex items-center justify-between border-b mt-4 pb-4"
            key={currentOrder.id}
          >
            <div className="flex items-center">
              <img className="w-24" src={pizza.img} />
              <div className="ml-5">
                <div className="text-xl font-bold">{pizza.name}</div>
                <div className="text-gray-400 text-xs">{pizza.type}</div>
              </div>
            </div>
            <div>{pizza.price}</div>
          </div>
        ))}
      </div>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white">
        <div className="text-lg mb-7 font-bold">Ждем ваш отзыв</div>
        <div className="flex mt-3 w-96 h-28">
          <div>
            <textarea
              {...register('review')}
              className="w-96 h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none text-xs"
              placeholder="Ваш коментарии увидет только куръер"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <button className="text-xl text-gray-500 bg-gray-100 flex h-12 items-center  rounded-full w-80 justify-evenly">
            <img src="/left.png" />
            <div>Отменить заказ</div>
          </button>
          <button
            className="text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full w-80"
            onClick={() => router.push('/')}
          >
            <div>На главную</div>
            <img src="/right.png" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(OrderAccept)
