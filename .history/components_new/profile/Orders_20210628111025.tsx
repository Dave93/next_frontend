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
      <div className="border  p-10 rounded-2xl text-xl">
        <div className="flex  text-base justify-between border-b pb-8">
          <div>№ 433</div>
          <div>26 май 2021 г. 19:11</div>
          <div className="w-40">ул., Буюк Ипак Йули, Дом 95а, кв 31</div>
          <div>3 товара</div>
          <div>108 000 сум</div>
          <div className="ml-56 text-green-600">Доставлено</div>
        </div>
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Panel className="">
                If you're unhappy with your purchase for any reason, email us
                within 90 days and we'll refund you in full, no questions asked.
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
    </div>
  )
}

export default memo(Orders)
