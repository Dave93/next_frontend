import { FC } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'

const PersonalData: FC = () => {
  type FormData = {
    name: string
    phone: string
    mail: string
    birthDay: string
  }
  const { register, handleSubmit, reset, watch, formState } = useForm<FormData>(
    {
      mode: 'onChange',
    }
  )

  const onSubmit = (data: any) => console.log(JSON.stringify(data))

  const authName = watch('name')
  const authPhone = watch('phone')
  const authMail = watch('mail')

  return (
    <div className="w-full max-w-xs">
      <div className="text-2xl mt-8 mb-5">Личные данные</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10">
          <label className="text-sm text-gray-400 mb-2 block">Имя</label>
          <div className="relative">
            <input
              type="text"
              {...register('name')}
              className="border focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
            />
            {authName && (
              <button
                className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                onClick={() => reset()}
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
                onClick={() => reset()}
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
              {...register('mail')}
              className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
            />
            {authMail && (
              <button
                className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                onClick={() => reset()}
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
          <div className="relative">
            <input
              type="text"
              {...register('birthDay')}
              className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
            />
            {authName && (
              <button
                className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                onClick={() => reset()}
              >
                <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-10">
          <button
            className={`py-3 px-20 text-white font-bold text-xl rounded-full bg-yellow`}
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}

export default PersonalData
