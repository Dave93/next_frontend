'use client'

import { FC, Fragment, useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useUI } from '@components/ui/context'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useExtracted } from 'next-intl'
import axios from 'axios'
import Cookies from 'js-cookie'

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  let out = ''
  if (digits.length > 0) out += '(' + digits.slice(0, 2)
  if (digits.length >= 2) out += ') '
  if (digits.length > 2) out += digits.slice(2, 5)
  if (digits.length >= 5) out += ' '
  if (digits.length > 5) out += digits.slice(5, 7)
  if (digits.length >= 7) out += ' '
  if (digits.length > 7) out += digits.slice(7, 9)
  return out
}

const formatCode = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  return digits.split('').join(' ')
}

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
  const [isLoading, setIsLoading] = useState(false)
  const otpTimer = useRef<any>(null)
  const phoneForm = useForm<PhoneForm>({ defaultValues: { phone: '', name: '' } })
  const codeForm = useForm<CodeForm>({ defaultValues: { code: '' } })

  const phoneVal = phoneForm.watch('phone')
  const phoneDigits = phoneVal?.replace(/\D/g, '').slice(3) || ''
  const phoneReady = phoneDigits.length === 9 && (!showName || !!phoneForm.watch('name'))

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
    setIsLoading(true)
    try {
      if (!executeRecaptcha) {
        setSubmitError(t('Капча не готова, попробуйте ещё раз'))
        return
      }
      const captcha = await executeRecaptcha('send_otp')
      await setCsrf()
      const cleanPhone = data.phone.replace(/\D/g, '')
      const res = await axios.post(
        `${webAddress}/api/send_otp`,
        { phone: `+${cleanPhone}`, name: data.name || undefined },
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
        setSavedPhone(`+${cleanPhone}`)
        startTimer(result?.time_to_answer || 60)
        setStep('code')
      }
    } catch (err: any) {
      setSubmitError(err?.message || t('Не удалось отправить код'))
    } finally {
      setIsLoading(false)
    }
  }

  const onCodeSubmit: SubmitHandler<CodeForm> = async (data) => {
    setSubmitError('')
    setIsLoading(true)
    try {
      const otpToken = Cookies.get('opt_token')
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('phone')
    setShowName(false)
    setSubmitError('')
    setSavedPhone('')
    setSecondsLeft(0)
    if (otpTimer.current) clearInterval(otpTimer.current)
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
            <DialogPanel className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
              <button
                type="button"
                onClick={handleClose}
                aria-label="close"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="flex flex-col items-center mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#FFF4D6' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                      stroke="#F9B004"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {t('Авторизация')}
                </h3>
              </div>

              {step === 'phone' ? (
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}>
                  <div className="text-xs text-center text-gray-400 mb-2">
                    {t('Номер телефона')}
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                    <span className="pl-5 pr-3 text-gray-700">+998</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="(XX) XXX XX XX"
                      value={formatPhone(phoneForm.watch('phone') || '')}
                      onChange={(e) =>
                        phoneForm.setValue('phone', e.target.value.replace(/\D/g, ''))
                      }
                      className="flex-1 py-3 pr-5 outline-none text-gray-700"
                    />
                  </div>

                  {showName && (
                    <input
                      type="text"
                      placeholder={t('Имя')}
                      {...phoneForm.register('name', { required: showName })}
                      className="mt-3 w-full px-5 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-yellow-400"
                    />
                  )}

                  <div className="text-center text-xs text-gray-400 mt-4 mb-5">
                    {t('Если сообщение не пришло, позвоните нам по номеру')} 71{' '}
                    <a
                      href="tel:+998712051111"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      205 11 11
                    </a>
                  </div>

                  {submitError && (
                    <div className="mb-3 text-sm text-red-500 text-center">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!phoneReady || isLoading}
                    className="w-full h-12 rounded-full font-semibold text-white transition-colors"
                    style={{
                      backgroundColor: phoneReady ? '#F9B004' : '#E5E7EB',
                      color: phoneReady ? '#fff' : '#9CA3AF',
                    }}
                  >
                    {isLoading ? '...' : t('Получить код')}
                  </button>
                </form>
              ) : (
                <form onSubmit={codeForm.handleSubmit(onCodeSubmit)}>
                  <div className="text-xs text-center text-gray-400 mb-2">
                    {t('Код подтверждения')}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="X X X X"
                    autoFocus
                    value={formatCode(codeForm.watch('code') || '')}
                    onChange={(e) =>
                      codeForm.setValue('code', e.target.value.replace(/\D/g, ''))
                    }
                    className="w-full py-3 px-5 rounded-full border border-gray-200 outline-none focus:border-yellow-400 text-center text-lg tracking-widest"
                  />

                  <div className="text-center text-xs text-gray-400 mt-4 mb-5">
                    {t('Код отправлен на номер')} {savedPhone}
                  </div>

                  {submitError && (
                    <div className="mb-3 text-sm text-red-500 text-center">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-full font-semibold text-white"
                    style={{ backgroundColor: '#F9B004' }}
                  >
                    {isLoading ? '...' : t('Войти')}
                  </button>

                  <button
                    type="button"
                    onClick={() => secondsLeft === 0 && setStep('phone')}
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
