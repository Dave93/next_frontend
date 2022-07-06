import { FC } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { DateTime } from 'luxon'
import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import { ToastContainer, toast } from 'react-toastify'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true
const PersonalData: FC = () => {
  const { t: tr } = useTranslation('common')
  const { user, setUserData } = useUI()

  let birth = user?.user?.birth
  // birthDay, birthMonth, birthYear from date string of format YYYY-MM-DD

  let birthDay = birth?.split('-')[2]
  let birthMonth = birth?.split('-')[1]
  let birthYear = birth?.split('-')[0]

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
        name: user?.user?.name,
        phone: user?.user?.phone,
        email: user?.user?.email,
        birthDay: birthDay,
        birthMonth: birthMonth,
        birthYear: birthYear,
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
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const onSubmit = async (data: any) => {
    let birth = null
    if (data.birthDay && data.birthMonth && data.birthYear) {
      // init current date
      let currentTime = DateTime.local()

      // Change month, day and year of current date
      currentTime = currentTime.set({
        day: data.birthDay,
        month: data.birthMonth,
        year: data.birthYear,
      })
      // Convert date to format YYYY-MM-DD
      birth = currentTime.toFormat('yyyy-MM-dd')
    }

    const { name, phone, email } = data

    await setCredentials()

    const otpToken = Cookies.get('opt_token')
    try {
      const { data } = await axios.post(
        `${webAddress}/api/me`,
        {
          name,
          phone,
          email,
          birth,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      toast.success(tr('saved'), {
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
      toast.error(e.response.data.error.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
    }
  }

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
    <div className="md:w-full md:max-w-xs mx-5 md:mx-0 mb-5">
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
            {tr('personal_phone')}
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
          <label className="text-sm text-gray-400 mb-2 block">
            {tr('personal_email')}
          </label>
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
            {tr('personal_birth')}
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
            {tr('personal_save_button')}
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  )
}

export default PersonalData
