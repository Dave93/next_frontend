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
      <div>
        <div className="flex mt-3 w-96 h-28">
          <div>
            <textarea
              {...register('review')}
              className="w-96 h-28 bg-gray-100 rounded-2xl p-3 outline-none focus:outline-none resize-none"
              placeholder="Ваш коментарии увидет только куръер"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <button className="text-xl text-gray-400 bg-gray-200 flex h-12 items-center justify-between px-12 rounded-full w-80">
            <img src="/left.png" /> Вернуться в корзину
          </button>
          <button className="text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full w-80">
            Оплатить
            <img src="/right.png" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(OrderAccept)
