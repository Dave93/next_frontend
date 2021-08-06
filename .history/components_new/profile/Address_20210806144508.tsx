import { memo, FC } from 'react'
import AddresItems from '@commerce/data/address'
import useTranslation from 'next-translate/useTranslation'
import { Disclosure } from '@headlessui/react'

const Address: FC = () => {
  const { t: tr } = useTranslation('common')
  let items = AddresItems.map((item) => {
    return {
      ...item,
      type: tr(item.type),
    }
  })
  return (
    <>
      <div className="text-2xl mt-8 mb-5">{tr('profile_address')}</div>
      {items.map((value, key) => (
        <div key={key} className="mb-5">
          <div className="border flex items-center justify-between p-10 rounded-2xl text-xl">
            <div className="text-white text-sm rounded-full bg-red-600 w-20 align-items-center text-center py-1">
              {value.type}
            </div>
            <div>{value.address}</div>
            <button className="text-gray-400 text-sm rounded-full bg-gray-100 align-items-center text-center w-28 py-1">
              {tr('profile_address_change')}
            </button>
          </div>
        </div>
      ))}
      <Disclosure>
        {({ open }) => (
          <>
            {open && (
              <>
                <div key={} className="mb-5">
                  <div className="border flex items-center justify-between p-10 rounded-2xl text-xl">
                    <div className="text-white text-sm rounded-full bg-red-600 w-20 align-items-center text-center py-1">
                      Добавить адрес
                    </div>
                    <button className="text-gray-400 text-sm rounded-full bg-gray-100 align-items-center text-center w-28 py-1">
                      {tr('profile_address_change')}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between mt-8">
              <Disclosure.Button className="border flex focus:outline-none items-center justify-between px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-gray-100 text-gray-400">
                <div className="ml-auto">{tr('order_detail')}</div>
              </Disclosure.Button>
            </div>
          </>
        )}
      </Disclosure>
    </>
  )
}

export default memo(Address)
