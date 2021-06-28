import { FC, memo } from 'react'
import OrdersItems from '@commerce/data/orders'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

const Orders: FC = () => {
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
      {items.map((item) => (
        <div className="border  p-10 rounded-2xl text-xl mt-5">
          <Disclosure>
            {({ open }) => (
              <>
                <div className="flex  text-base justify-between border-b pb-8">
                  {open ? (
                    <div className="font-bold text-xl">
                      {tr('order')} № {item.id}
                    </div>
                  ) : (
                    <div> № {item.id}</div>
                  )}

                  {!open && (
                    <>
                      <div>{item.date}</div>
                      <div className="w-40">{item.address}</div>
                      <div>{item.productCount}</div>
                      <div>{item.totalPrice}</div>
                    </>
                  )}
                  <div
                    className={`ml-56 ${
                      item.statusCode == 'order_delivered'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {item.name}
                  </div>
                </div>
                {item.items.map((pizza) => (
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
                ))}
                {open && (
                  <>
                    <div className="flex items-center justify-between border-b pt-7 pb-7">
                      <div>{tr('order_price')}</div>
                      <div className="font-bold">{item.totalPrice}</div>
                    </div>
                    <div className="flex items-center justify-between border-b pt-7 pb-7">
                      <div>{tr('order_address')}</div>
                      <div>{item.address}</div>
                    </div>
                    <div className="flex items-center justify-between border-b pt-7 pb-7">
                      <div>{tr('order_time')}</div>
                      <div> {item.date}</div>
                    </div>
                  </>
                )}

                <div className="flex justify-between mt-8">
                  <Disclosure.Button className="border flex focus:outline-none items-center justify-between px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-gray-100 text-gray-400">
                    <div className="ml-14">{tr('order_detail')}</div>
                    <ChevronDownIcon
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-5 h-5 text-purple-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure>
                    <Disclosure.Button className="border flex focus:outline-none items-center justify-center px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-yellow text-white">
                      <div>{tr('order_repeat')}</div>
                    </Disclosure.Button>
                  </Disclosure>
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
