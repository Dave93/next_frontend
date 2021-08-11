import { FC, memo } from 'react'
import { useForm } from 'react-hook-form'

const Contacts: FC = () => {
  type FormData = {
    street: string
    house: string
    flat: string
    floor: string
    door_code: string
    addressType: string
  }
  const { register } = useForm<FormData>({
    defaultValues: {
      street: '',
      house: '',
      flat: '',
      floor: '',
      door_code: '',
      addressType: '',
    },
  })

  return (
    <>
      <div>
        <div className="text-3xl mb-1">Контакты</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
      </div>
      <div className="grid grid-cols-3 gap-24 mb-16">
        <div>
          <div className="mb-3">ООО « Havoqand People »</div>
          <div className="mb-3">
            Юридический адрес: г. Ташкент, Чиланзарский район, ул. Катартал, д.
            28
          </div>
          <div className="mb-3">
            Режим работы: 10:00 - 22:00, без перерыва и выходных
          </div>
          <div>Телефон: 71-200-42-42</div>
        </div>
        <div>
          <div className="mb-3">ООО « Havoqand People »</div>
          <div className="mb-3">
            Юридический адрес: г. Ташкент, Чиланзарский район, ул. Катартал, д.
            28
          </div>
          <div className="mb-3">
            Режим работы: 10:00 - 22:00, без перерыва и выходных
          </div>
          <div>Телефон: 71-200-42-42</div>
        </div>
      </div>
      <div className="border border-gray-400 rounded-2xl">
        <div>Оставьте свой отзыв</div>
        <div className="flex justify-between">
          <div className="w-80">
            <label className="text-sm text-gray-400">{tr('street')}</label>
            <input
              type="text"
              {...register('street')}
              className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
            />
          </div>
          <div className="w-80">
            <label className="text-sm text-gray-400">
              {tr('profile_address_home')}
            </label>
            <input
              type="text"
              {...register('house')}
              className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
            />
          </div>
          <div className="w-80">
            <label className="text-sm text-gray-400">{tr('flat')}</label>
            <input
              type="text"
              {...register('flat')}
              className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
            />
          </div>
        </div>
        <div className="flex justify-between mt-7">
          <div className="w-80">
            <label className="text-sm text-gray-400">{tr('floor')}</label>
            <input
              type="text"
              {...register('floor')}
              className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
            />
          </div>
          <div className="w-80">
            <label className="text-sm text-gray-400">
              {tr('code_on_doors')}
            </label>
            <input
              type="text"
              {...register('door_code')}
              className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
            />
          </div>
          <div className="w-80">
            <label className="text-sm text-gray-400">
              {tr('address_name')}
            </label>
            <input
              type="text"
              {...register('addressType')}
              className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full mt-2"
            />
            <button className="bg-yellow rounded-full w-80 py-2 mt-10 text-white">
              {tr('save')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(Contacts)
