import useTranslation from 'next-translate/useTranslation'
import { FC, memo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { XIcon } from '@heroicons/react/outline'
import Input from 'react-phone-number-input/input'

const Contacts: FC = () => {
  const { t: tr } = useTranslation('common')

  type FormData = {
    name: string
    phone: string
    email: string
    order_id: string
    text: string
  }
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      order_id: '',
      text: '',
    },
  })
  const name = watch('name')
  const phone = watch('phone')
  const email = watch('email')
  const order_id = watch('order_id')
  const text = watch('text')

  const onSubmit = (data: any) => console.log(JSON.stringify(data))

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }

  return (
    <div className="mx-5 md:mx-0">
      <div>
        <div className="text-3xl mb-1">{tr('contacts')}</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
      </div>
      <div className="md:grid grid-cols-3 gap-24 mb-16">
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border border-gray-400 rounded-2xl p-8 md:w-[724px] md:mb-96 mb-8">
          <div className="text-2xl mb-7">Оставьте свой отзыв</div>
          <div className="md:flex justify-between">
            <div className="md:w-80">
              <label className="text-sm text-gray-400">{tr('name')}</label>
              <div className="flex items-center justify-end">
                <input
                  type="text"
                  {...register('name', {
                    required: true,
                  })}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {name && (
                  <button
                    className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                    onClick={() => resetField('name')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
              {errors.name && (
                <div className="text-sm text-center text-red-600">
                  {tr('required')}
                </div>
              )}
            </div>
            <div className="md:w-80">
              <label className="text-sm text-gray-400">
                {tr('phone_number')}
              </label>
              <div className="md:flex items-center justify-end">
                <Controller
                  render={({ field: { onChange, value } }) => (
                    <Input
                      defaultCountry="UZ"
                      country="UZ"
                      international
                      withCountryCallingCode
                      value={value}
                      className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                      onChange={(e: any) => onChange(e)}
                    />
                  )}
                  rules={{
                    required: true,
                  }}
                  key="phone"
                  name="phone"
                  control={control}
                />
                {phone && (
                  <button
                    className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                    onClick={() => resetField('phone')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>

              {errors.phone && (
                <div className="text-sm text-center text-red-600">
                  {tr('required')}
                </div>
              )}
            </div>
          </div>
          <div className="md:flex md:mt-7 justify-between">
            <div className="md:w-80">
              <label className="text-sm text-gray-400">{tr('email')}</label>
              <div className="flex items-center justify-end">
                <input
                  type="text"
                  {...register('email')}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {email && (
                  <button
                    className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                    onClick={() => resetField('email')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="md:w-80">
              <label className="text-sm text-gray-400">
                {tr('order_number')}
              </label>
              <div className="md:flex items-center justify-end">
                <input
                  type="text"
                  {...register('order_id')}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {order_id && (
                  <button
                    className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                    onClick={() => resetField('order_id')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="md:mt-7">
            <label className="text-sm text-gray-400">{tr('review')}</label>
            <div className="flex items-center justify-end">
              <textarea
                {...register('text', { required: true })}
                rows={5}
                className="bg-gray-100 px-8 py-2 rounded-lg outline-none focus:outline-none w-full"
              />
              {text && (
                <button
                  className="absolute focus:outline-none outline-none  text-gray-400 mr-4"
                  onClick={() => resetField('text')}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>

            {errors.text && (
              <div className="text-sm text-center text-red-600">
                {tr('required')}
              </div>
            )}
          </div>
          <div className="ml-auto md:w-80">
            <button className="bg-yellow rounded-full md:w-80 w-full py-2 mt-10 text-white">
              {tr('save')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default memo(Contacts)
