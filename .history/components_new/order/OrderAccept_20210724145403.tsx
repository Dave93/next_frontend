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
  const { user } = useUI()
  let items = OrdersItems.map((item) => {
    return {
      ...item,
      name: tr(item.statusCode),
    }
  })

  return (
    <div>
      <div className="text-2xl mt-8 mb-5">{tr('order_myOrders')}</div>
          <div className="border  p-10 rounded-2xl text-xl mt-5">
              
      {items.map((item) =>
        item.items.map((pizza) => (
          <div className="flex items-center justify-between border-b mt-4 pb-4">
            <div className="flex items-center">
              <img className="w-24" src={pizza.img} />
              <div className="ml-5">
                <div className="text-xl font-bold">{pizza.name}</div>
                <div className="text-gray-400 text-xs">{pizza.type}</div>
              </div>
            </div>
            <div>{pizza.price}</div>
          </div>
        ))
      )}
      </div>
    </div>
  )
}

export default memo(OrderAccept)
