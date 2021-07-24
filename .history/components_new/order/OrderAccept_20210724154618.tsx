import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import React, { memo, FC } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import OrdersItems from '@commerce/data/orders'
import Link from 'next/link'

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

    const currentOrder = items.find((item: any) => item.id == orderId);
    console.log(currentOrder)
    
  return (
    <div>
      <div className="border  p-10 rounded-2xl text-xl mt-5">
        <div className="text-2xl mb-10 font-bold">
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
    </div>
  )
}

export default memo(OrderAccept)
