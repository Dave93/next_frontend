import { memo, FC } from 'react'
import AddresItems from '@commerce/data/address'
import useTranslation from 'next-translate/useTranslation'

const Address: FC = () => {
  const { t: tr } = useTranslation('common')
  let items = AddresItems.map((item) => {
    return {
      ...item,
      address: tr(item.type),
    }
  })
  return (
    <>
      <div className="text-2xl mt-8 mb-5">{tr('profile_address')}</div>
      {items.map((value, key) => (
        <div key={key} className="mb-5">
          <div className="border flex h-28 justify-between p-10 rounded-2xl text-xl">
            <div className="text-yellow rounded-full bg-red-600">{value.address} </div>
            <div className="font-bold">
              {tr('profile_address_change')}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default memo(Address)
