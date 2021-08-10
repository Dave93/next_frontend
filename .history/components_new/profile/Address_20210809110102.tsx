import { memo, FC } from 'react'
import AddresItems from '@commerce/data/address'
import useTranslation from 'next-translate/useTranslation'
import { Disclosure } from '@headlessui/react'
import { useForm } from 'react-hook-form'

const Address: FC = () => {
  const { t: tr } = useTranslation('common')

  let items = AddresItems.map((item) => {
    return {
      ...item,
      type: tr(item.type),
    }
  })

  type FormData = {
    street: string
    house: string
    flat: string
    floor: string
    door_code: string
    addressType: string
  }
  const { register, handleSubmit, reset, watch, formState, getValues } =
    useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        street: '',
        house: '',
        flat: '',
        floor: '',
        door_code: '',
        addressType: '',
      },
    })

  const onSubmit = (data: any) => console.log(JSON.stringify(data))

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
          <div className="mb-5">
            <div className="border items-center justify-between p-10 rounded-2xl text-xl pb-28">
              <div className="flex justify-between">
                <div className="text-gray-400 text-xl">Добавить адрес</div>
                {open ? (
                  <Disclosure.Button className="text-gray-400 text-sm rounded-full bg-gray-100 align-items-center text-center w-28 py-1">
                    {tr('profile_address_cancel')}
                  </Disclosure.Button>
                ) : (
                  <Disclosure.Button className="">
                    <img src="/assets/Plus.png" />
                  </Disclosure.Button>
                )}
              </div>
              <div>
                <Disclosure.Panel className="">
                  <div className="border-t mt-7">
                    <div className="mt-7">
                      <div className="flex justify-between">
                        <div className="w-80">
                          <label className="text-sm text-gray-400">Улица</label>
                          <input
                            type="text"
                            {...register('street')}
                            className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
                          />
                        </div>
                        <div className="w-80">
                          <label className="text-sm text-gray-400">Дом</label>
                          <input
                            type="text"
                            {...register('house')}
                            className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
                          />
                        </div>
                        <div className="w-80">
                          <label className="text-sm text-gray-400">
                            Квартира
                          </label>
                          <input
                            type="text"
                            {...register('flat')}
                            className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between mt-7">
                        <div className="w-80">
                          <label className="text-sm text-gray-400">Этаж</label>
                          <input
                            type="text"
                            {...register('floor')}
                            className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
                          />
                        </div>
                        <div className="w-80">
                          <label className="text-sm text-gray-400">
                            Код на двери
                          </label>
                          <input
                            type="text"
                            {...register('door_code')}
                            className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
                          />
                        </div>
                        <div className="w-80">
                          <label className="text-sm text-gray-400">
                            Название адреса
                          </label>
                          <input
                            type="text"
                            {...register('addressType')}
                            className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                      <button className="bg-yellow float-right rounded-full px-28 py-2 mt-10">
                        {tr('save')}
                      </button>
                </Disclosure.Panel>
              </div>
            </div>
          </div>
        )}
      </Disclosure>
    </>
  )
}

export default memo(Address)
