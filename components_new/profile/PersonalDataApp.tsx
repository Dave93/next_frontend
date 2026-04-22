'use client'

import { FC } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import { useUI } from '@components/ui/context'
import axios from 'axios'
import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify'

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const PersonalDataApp: FC = () => {
  const { user, setUserData } = useUI()

  type FormData = {
    name: string
    phone: string
    email: string
    birth: string
  }

  const { register, handleSubmit, reset, watch, getValues } =
    useForm<FormData>({
      mode: 'onChange',
      defaultValues: {
        name: user?.user?.name,
        phone: user?.user?.phone,
        email: user?.user?.email,
        birth: user?.user?.birth || '',
      },
    })

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      const { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      const inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const onSubmit = async (data: any) => {
    const birth = data.birth || null
    const { name, phone, email } = data

    await setCredentials()

    const otpToken = Cookies.get('opt_token')
    try {
      await axios.post(
        `${webAddress}/api/me`,
        { name, phone, email, birth },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      toast.success('Сохранено', {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      setUserData({
        user: {
          ...user?.user,
          name,
          phone,
          email,
          birth,
        },
      })
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || 'Ошибка', {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
    }
  }

  const authName = watch('name')
  const authEmail = watch('email')

  const resetField = (fieldName: string) => {
    const newFields: any = { ...getValues() }
    newFields[fieldName] = null
    reset(newFields)
  }

  return (
    <div className="md:w-full md:max-w-xs mx-5 md:mx-0 mb-5 pb-20 md:pb-5">
      <div className="text-2xl mt-8 mb-5 hidden md:block">Личные данные</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-5 md:mt-10">
          <label className="text-sm text-gray-400 mb-2 block">Имя</label>
          <div className="relative">
            <input
              type="text"
              {...register('name')}
              className="border focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
            />
            {authName && (
              <button
                type="button"
                className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                onClick={() => resetField('name')}
              >
                <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-5 md:mt-10">
          <label className="text-sm text-gray-400 mb-2 block">Телефон</label>
          <div className="relative">
            <input
              type="text"
              readOnly
              {...register('phone')}
              className="border focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="mt-5 md:mt-10">
          <label className="text-sm text-gray-400 mb-2 block">Email</label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              className="borde focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
            />
            {authEmail && (
              <button
                type="button"
                className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                onClick={() => resetField('email')}
              >
                <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-5 md:mt-10">
          <label className="text-sm text-gray-400 mb-2 block">
            Дата рождения
          </label>
          <input
            type="date"
            {...register('birth')}
            className="border focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full bg-gray-200"
          />
        </div>
        <div className="mt-5 md:mt-10">
          <button
            type="submit"
            className="text-white font-bold text-xl rounded-full bg-yellow w-full h-10"
          >
            Сохранить
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  )
}

export default PersonalDataApp
