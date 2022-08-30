import { FC } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
export default function Contact() {
  const { t: tr } = useTranslation('common')
  const { user, setUserData } = useUI()

  type FormData = {
    name: string
    phone: string
    email: string
  }
  const { register, handleSubmit, reset, watch, formState, getValues } =
    useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        name: user?.user?.name,
        phone: user?.user?.phone,
        email: ''
      },
    })

  const onSubmit = (data: any) => console.log(JSON.stringify(data))

  const authName = watch('name')
  const authPhone = watch('phone')
  const authEmail = watch('email')

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    }
    newFields[fieldName] = null
    reset(newFields)
  }
  return (
    <div className="w-full bg-white my-5 rounded-2xl">
      <div className="md:p-10">
        <div className="text-2xl mb-5 font-bold">
          {tr('order_your_contacts')}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="md:w-80">
          <div className="mt-8">
            <label className="text-sm text-gray-400 mb-2 block">
              {tr('personal_data_name')}
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('name')}
                className="border focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200 text-gray-400"
              />
              {authName && (
                <button
                  className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                  onClick={() => resetField('name')}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-8">
            <label className="text-sm text-gray-400 mb-2 block">
              {tr('personal_phone')}
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('phone', {
                  required: true,
                  pattern: /^\+998\d\d\d\d\d\d\d\d\d$/i,
                })}
                className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200 text-gray-400 "
              />
              {authPhone && (
                <button
                  className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-200"
                  onClick={() => resetField('phone')}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-200 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-8">
            <label className="text-sm text-gray-400 mb-2 block">
              {tr('personal_email')}
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email')}
                className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200 text-gray-400 "
              />
              {authEmail && (
                <button
                  className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                  onClick={() => resetField('email')}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
