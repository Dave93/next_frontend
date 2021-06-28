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
  const { locale, pathname } = router

  const { user } = useUI()
  let items = OrdersItems.map((item) => {
    return {
      ...item,
      name: tr(item.statusCode),
    }
  })

  console.log(items)

  return (
    <div>
      <div className="text-2xl mt-8 mb-5">Мои заказы</div>
      {items.map((item) => (
        <div className="border  p-10 rounded-2xl text-xl mt-5">
          <Disclosure>
            {({ open }) => (
              <>
                <div className="flex  text-base justify-between border-b pb-8">
                  <div>№ {item.id}</div>
                  <div>{item.date}</div>
                  <div className="w-40">{item.address}</div>
                  <div>{item.productCount}</div>
                  <div>{item.price}</div>
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
                <Disclosure.Panel className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img className="w-24" src={item.img} />
                    <div className="ml-5">
                      <div className="text-xl">Пепперони</div>
                      <div className="text-gray-200 text-xs">
                        Средняя 32 см, Традиционное тесто
                      </div>
                    </div>
                  </div>
                  <div>36 000 сўм</div>
                </Disclosure.Panel>

                <div className="flex justify-between mt-8">
                  <Disclosure.Button className="border flex focus:outline-none items-center justify-end px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-gray-100 text-gray-400">
                    <span className="mr-12">Детали заказа</span>
                    <ChevronDownIcon
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-6 h-6 text-purple-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure>
                    <Disclosure.Button className="border flex focus:outline-none items-center justify-end px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-yellow text-white">
                      <span className="mr-12">Повторить заказ</span>
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
