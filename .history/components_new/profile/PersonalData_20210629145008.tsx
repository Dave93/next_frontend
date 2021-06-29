import { FC } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'

const PersonalData: FC = () => {
  const { t: tr } = useTranslation('common')
  const { user, setUserData } = useUI()

  type FormData = {
    name: string
    phone: string
    email: string
    birthDay: string
    birthMonth: string
    birthYear: string
  }
  const { register, handleSubmit, reset, watch, formState, getValues } =
    useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        name: 'Shahzod',
        phone: user.user_contact,
        email: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
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
    <div className="w-full max-w-xs">
      <div className="text-2xl mt-8 mb-5">{tr('personal_data')}</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10">
          <label className="text-sm text-gray-400 mb-2 block">
            {tr('personal_data_name')}
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('name')}
              className="border focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
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
        <div className="mt-10">
          <label className="text-sm text-gray-400 mb-2 block">
            Номер телефона
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('phone', {
                required: true,
                pattern: /^\+998\d\d\d\d\d\d\d\d\d$/i,
              })}
              className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
            />
            {authPhone && (
              <button
                className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                onClick={() => resetField('phone')}
              >
                <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-10">
          <label className="text-sm text-gray-400 mb-2 block">Эл. почта</label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
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
        <div className="mt-10">
          <label className="text-sm text-gray-400 mb-2 block">
            День рождения
          </label>
          <div className="flex justify-between">
            <input
              type="text"
              pattern="\d*"
              maxLength={2}
              {...register('birthDay')}
              className="borde focus:outline-none outline-none px-10 py-3 rounded-full text-sm w-24 bg-gray-200"
            />
            <input
              type="text"
              pattern="\d*"
              maxLength={2}
              {...register('birthMonth')}
              className="borde focus:outline-none outline-none px-10 py-3 rounded-full text-sm w-24 bg-gray-200"
            />
            <input
              type="text"
              pattern="\d*"
              maxLength={4}
              {...register('birthYear')}
              className="borde focus:outline-none outline-none pl-8 py-3 rounded-full text-sm w-24 bg-gray-200"
            />
          </div>
        </div>
        <div className="mt-10">
          <button className="text-white font-bold text-xl rounded-full bg-yellow w-full h-10">
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}

export default PersonalData
