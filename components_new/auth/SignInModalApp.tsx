'use client'

import { FC, Fragment, useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useUI } from '@components/ui/context'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useExtracted } from 'next-intl'
import axios from 'axios'
import Cookies from 'js-cookie'

const webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const errorMessages: Record<string, string> = {
  user_not_found: 'Пользователь не найден',
  invalid_otp: 'Неверный код',
  name_field_is_required: 'Введите имя',
  too_many_requests: 'Слишком много запросов, попробуйте позже',
}

type PhoneForm = { phone: string; name?: string }
type CodeForm = { code: string }

const SignInModalApp: FC = () => {
  const { showSignInModal, closeSignInModal, setUserData } = useUI() as any
  const { executeRecaptcha } = useGoogleReCaptcha()
  const t = useExtracted()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [showName, setShowName] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [savedPhone, setSavedPhone] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const otpTimer = useRef<any>(null)
  const phoneForm = useForm<PhoneForm>()
  const codeForm = useForm<CodeForm>()

  const startTimer = useCallback((sec: number) => {
    setSecondsLeft(sec)
    if (otpTimer.current) clearInterval(otpTimer.current)
    otpTimer.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(otpTimer.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => {
    if (otpTimer.current) clearInterval(otpTimer.current)
  }, [])

  const setCsrf = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        withCredentials: true,
      })
      const { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: new Date(Date.now() + 10 * 60 * 1000),
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
  }

  const onPhoneSubmit: SubmitHandler<PhoneForm> = async (data) => {
    setSubmitError('')
    if (!executeRecaptcha) {
      setSubmitError(t('Капча не готова, попробуйте ещё раз'))
      return
    }
    const captcha = await executeRecaptcha('send_otp')
    await setCsrf()
    try {
      const res = await axios.post(
        `${webAddress}/api/send_otp`,
        { phone: data.phone, name: data.name || undefined },
        {
          headers: { 'Content-Type': 'application/json', wtf: captcha },
          withCredentials: true,
        }
      )
      const { error: otpError, data: result, success } = res.data as any
      if (otpError) {
        if (otpError === 'name_field_is_required') setShowName(true)
        setSubmitError(errorMessages[otpError] || otpError)
        return
      }
      if (success) {
        const decoded = JSON.parse(
          Buffer.from(success, 'base64').toString('ascii')
        )
        Cookies.set('opt_token', decoded.user_token)
        localStorage.setItem('opt_token', decoded.user_token)
        setSavedPhone(data.phone)
        startTimer(result?.time_to_answer || 60)
        setStep('code')
      }
    } catch (err: any) {
      setSubmitError(err?.message || t('Не удалось отправить код'))
    }
  }

  const onCodeSubmit: SubmitHandler<CodeForm> = async (data) => {
    setSubmitError('')
    const otpToken = Cookies.get('opt_token')
    try {
      const res = await axios.post(
        `${webAddress}/api/auth_otp`,
        { phone: savedPhone, code: data.code },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      const { result } = res.data as any
      const decoded = JSON.parse(
        Buffer.from(result, 'base64').toString('ascii')
      )
      setUserData(decoded)
      Cookies.set('opt_token', decoded.token)
      localStorage.setItem('opt_token', decoded.token)
      handleClose()
    } catch (err: any) {
      setSubmitError(err?.response?.data?.error || t('Неверный код'))
    }
  }

  const handleClose = () => {
    setStep('phone')
    setShowName(false)
    setSubmitError('')
    setSavedPhone('')
    phoneForm.reset()
    codeForm.reset()
    closeSignInModal()
  }

  return (
    <Transition show={!!showSignInModal} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <DialogTitle className="text-xl font-bold mb-4">
                {step === 'phone' ? t('Войти') : t('Введите код')}
              </DialogTitle>
              {step === 'phone' ? (
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}>
                  <label className="text-sm text-gray-500 mb-1 block">
                    {t('Номер телефона')}
                  </label>
                  <input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    {...phoneForm.register('phone', { required: true })}
                    className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-yellow-400"
                  />
                  {showName && (
                    <>
                      <label className="text-sm text-gray-500 mt-3 mb-1 block">
                        {t('Имя')}
                      </label>
                      <input
                        type="text"
                        {...phoneForm.register('name', { required: showName })}
                        className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-yellow-400"
                      />
                    </>
                  )}
                  {submitError && (
                    <div className="mt-3 text-sm text-red-500">
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="mt-5 w-full h-11 rounded-full font-semibold text-white"
                    style={{ backgroundColor: '#F9B004' }}
                  >
                    {t('Получить код')}
                  </button>
                </form>
              ) : (
                <form onSubmit={codeForm.handleSubmit(onCodeSubmit)}>
                  <div className="text-sm text-gray-500 mb-3">
                    {t('Код отправлен на номер')} {savedPhone}
                  </div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    {t('Код подтверждения')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    {...codeForm.register('code', { required: true })}
                    className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-yellow-400 text-center tracking-widest"
                  />
                  {submitError && (
                    <div className="mt-3 text-sm text-red-500">
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="mt-5 w-full h-11 rounded-full font-semibold text-white"
                    style={{ backgroundColor: '#F9B004' }}
                  >
                    {t('Войти')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    disabled={secondsLeft > 0}
                    className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {secondsLeft > 0
                      ? `${t('Отправить код повторно через')} ${secondsLeft}`
                      : t('Отправить код повторно')}
                  </button>
                </form>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export default SignInModalApp
