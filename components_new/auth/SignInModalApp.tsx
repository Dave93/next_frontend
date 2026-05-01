'use client'

import { FC, Fragment, useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useUIStore } from '../../lib/stores/ui-store'
import { useUserStore } from '../../lib/stores/user-store'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useExtracted } from 'next-intl'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
  trackOtpSubmitClicked,
  trackOtpRecaptchaStarted,
  trackOtpRecaptchaSuccess,
  trackOtpRecaptchaFailed,
  trackOtpRequestSent,
  trackOtpRequestResponded,
  trackOtpRequestError,
  trackOtpCodeSubmitClicked,
  trackOtpVerified,
  trackOtpVerifyFailed,
} from '@lib/posthog-events'

// iOS Safari sometimes leaves grecaptcha.execute() pending forever after
// bfcache restore or on flaky networks. Without a hard ceiling the user
// stares at a spinner, taps the button repeatedly, and PostHog records
// "11 clicks, zero requests" while the backend sees nothing. 8s is long
// enough to cover normal worst-case (~3-4s on 3G) and short enough that
// the user can recover with a page reload.
const RECAPTCHA_TIMEOUT_MS = 8000

const recaptchaWithTimeout = (
  exec: () => Promise<string>
): Promise<{ token: string } | { timeout: true }> => {
  return new Promise((resolve) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve({ timeout: true })
    }, RECAPTCHA_TIMEOUT_MS)
    exec()
      .then((token) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve({ token })
      })
      .catch(() => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve({ token: '' })
      })
  })
}

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  let out = ''
  if (digits.length > 0) out += digits.slice(0, 2)
  if (digits.length > 2) out += ' ' + digits.slice(2, 5)
  if (digits.length > 5) out += ' ' + digits.slice(5, 7)
  if (digits.length > 7) out += ' ' + digits.slice(7, 9)
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

const SignInModalApp: FC = () => {
  const showSignInModal = useUIStore((s) => s.signInModalOpen)
  const closeSignInModal = useUIStore((s) => s.closeSignInModal)
  const setUserData = useUserStore((s) => s.setUserData)
  const { executeRecaptcha } = useGoogleReCaptcha()
  const t = useExtracted()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [showName, setShowName] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [savedPhone, setSavedPhone] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [phoneDigits, setPhoneDigits] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const otpTimer = useRef<any>(null)
  const sendAttempt = useRef(0)
  const codeStartTime = useRef(0)

  const phoneReady = phoneDigits.length === 9 && (!showName || !!name)

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

  const onPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    sendAttempt.current += 1
    const attempt = sendAttempt.current
    const fullPhone = `+998${phoneDigits}`
    trackOtpSubmitClicked({
      phone: fullPhone,
      is_loading: isLoading,
      attempt,
    })
    setSubmitError('')
    setIsLoading(true)
    try {
      if (!executeRecaptcha) {
        trackOtpRecaptchaFailed({
          phone: fullPhone,
          attempt,
          duration_ms: 0,
          reason: 'not_ready',
        })
        setSubmitError(t('Капча не готова, попробуйте ещё раз'))
        return
      }
      // Backend verifies action='signIn' (LoginController::sendOTP); must match.
      trackOtpRecaptchaStarted({ phone: fullPhone, attempt })
      const captchaStart = Date.now()
      const captchaResult = await recaptchaWithTimeout(() =>
        executeRecaptcha('signIn')
      )
      const captchaDuration = Date.now() - captchaStart

      if ('timeout' in captchaResult) {
        trackOtpRecaptchaFailed({
          phone: fullPhone,
          attempt,
          duration_ms: captchaDuration,
          reason: 'timeout',
        })
        setSubmitError(
          t('Капча не загрузилась, обновите страницу и попробуйте снова')
        )
        return
      }
      const captcha = captchaResult.token
      if (!captcha) {
        trackOtpRecaptchaFailed({
          phone: fullPhone,
          attempt,
          duration_ms: captchaDuration,
          reason: 'empty_token',
        })
        setSubmitError(
          t('Капча не загрузилась, обновите страницу и попробуйте снова')
        )
        return
      }
      trackOtpRecaptchaSuccess({
        phone: fullPhone,
        attempt,
        duration_ms: captchaDuration,
        token_length: captcha.length,
      })

      await setCsrf()
      trackOtpRequestSent({ phone: fullPhone, attempt })
      const requestStart = Date.now()
      let res
      try {
        res = await axios.post(
          `${webAddress}/api/send_otp`,
          { phone: fullPhone, name: name || undefined },
          {
            headers: { 'Content-Type': 'application/json', wtf: captcha },
            withCredentials: true,
          }
        )
      } catch (err: any) {
        const requestDuration = Date.now() - requestStart
        trackOtpRequestError({
          phone: fullPhone,
          attempt,
          duration_ms: requestDuration,
          status: err?.response?.status,
          error_message: err?.message,
        })
        setSubmitError(err?.message || t('Не удалось отправить код'))
        return
      }
      const requestDuration = Date.now() - requestStart
      const { error: otpError, data: result, success } = res.data as any
      if (otpError) {
        trackOtpRequestResponded({
          phone: fullPhone,
          attempt,
          duration_ms: requestDuration,
          outcome:
            otpError === 'name_field_is_required'
              ? 'name_required'
              : 'other_error',
          backend_error: otpError,
        })
        if (otpError === 'name_field_is_required') setShowName(true)
        setSubmitError(errorMessages[otpError] || otpError)
        return
      }
      if (success) {
        trackOtpRequestResponded({
          phone: fullPhone,
          attempt,
          duration_ms: requestDuration,
          outcome: 'success',
        })
        const decoded = JSON.parse(
          Buffer.from(success, 'base64').toString('ascii')
        )
        Cookies.set('opt_token', decoded.user_token)
        localStorage.setItem('opt_token', decoded.user_token)
        setSavedPhone(fullPhone)
        startTimer(result?.time_to_answer || 60)
        codeStartTime.current = Date.now()
        setStep('code')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    trackOtpCodeSubmitClicked({ phone: savedPhone, code_length: code.length })
    setSubmitError('')
    setIsLoading(true)
    const verifyStart = Date.now()
    try {
      const otpToken = Cookies.get('opt_token')
      const res = await axios.post(
        `${webAddress}/api/auth_otp`,
        { phone: savedPhone, code },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      const verifyDuration = Date.now() - verifyStart
      const { result } = res.data as any
      // Backend returns base64-encoded "false" (ZmFsc2U=) on a wrong OTP with HTTP 200.
      // JSON.parse("false") yields the boolean false; on success it's an object with
      // { user, user_token, ... } — we key off user_token to distinguish.
      const decoded = result
        ? JSON.parse(Buffer.from(result, 'base64').toString('ascii'))
        : null
      if (!decoded || typeof decoded !== 'object' || !decoded.user_token) {
        trackOtpVerifyFailed({
          phone: savedPhone,
          duration_ms: verifyDuration,
          reason: 'wrong_code',
        })
        setSubmitError(t('Неверный код'))
        return
      }
      trackOtpVerified({
        phone: savedPhone,
        duration_ms:
          codeStartTime.current > 0 ? Date.now() - codeStartTime.current : 0,
      })
      setUserData(decoded)
      Cookies.set('opt_token', decoded.user_token)
      localStorage.setItem('opt_token', decoded.user_token)
      handleClose()
    } catch (err: any) {
      trackOtpVerifyFailed({
        phone: savedPhone,
        duration_ms: Date.now() - verifyStart,
        reason: 'network_error',
        error_message: err?.message,
      })
      setSubmitError(err?.response?.data?.error || t('Неверный код'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('phone')
    setShowName(false)
    setSubmitError('')
    setPhoneDigits('')
    setName('')
    setCode('')
    setSavedPhone('')
    setSecondsLeft(0)
    sendAttempt.current = 0
    codeStartTime.current = 0
    if (otpTimer.current) clearInterval(otpTimer.current)
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
            <DialogPanel
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
              style={{ padding: '32px' }}
            >
              <button
                type="button"
                onClick={handleClose}
                aria-label="close"
                className="absolute outline-none focus:outline-none p-1"
                style={{ top: 16, right: 16 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="flex flex-col items-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'rgba(250, 175, 4, 0.1)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                      stroke="#F9B004"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3
                  className="leading-6 text-2xl md:text-3xl font-bold mb-1 text-gray-900 text-center"
                >
                  {t('Авторизация')}
                </h3>
                <p className="text-sm text-gray-400 mb-6 text-center">
                  {step === 'phone'
                    ? t('Номер телефона')
                    : t('Код подтверждения')}
                </p>
              </div>

              {step === 'phone' ? (
                <form onSubmit={onPhoneSubmit}>
                  {(() => {
                    const isIncomplete = phoneDigits.length > 0 && phoneDigits.length < 9
                    const isComplete = phoneDigits.length === 9
                    const ringColor = isComplete
                      ? '#10B981'
                      : isIncomplete
                      ? '#F9B004'
                      : '#E5E7EB'
                    const bgColor = isComplete
                      ? '#ECFDF5'
                      : isIncomplete
                      ? '#FFFBEB'
                      : '#F9FAFB'
                    return (
                      <div
                        className="flex items-center rounded-2xl px-4 py-3 transition-all duration-200"
                        style={{
                          boxShadow: `inset 0 0 0 ${
                            isIncomplete || isComplete ? 2 : 1
                          }px ${ringColor}`,
                          backgroundColor: bgColor,
                        }}
                      >
                        <span className="text-lg font-medium text-gray-400">
                          +998
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="XX XXX XX XX"
                          value={formatPhone(phoneDigits)}
                          onChange={(e) =>
                            setPhoneDigits(
                              e.target.value.replace(/\D/g, '').slice(0, 9)
                            )
                          }
                          className="flex-1 text-lg font-medium focus:outline-none focus:ring-0 outline-none border-none bg-transparent ml-3 placeholder-gray-300 text-gray-900"
                          style={{ padding: '8px 0' }}
                        />
                        {isComplete && (
                          <span
                            className="ml-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#10B981' }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                        {isIncomplete && (
                          <button
                            type="button"
                            onClick={() => setPhoneDigits('')}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            aria-label="clear"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )
                  })()}

                  {showName && (
                    <input
                      type="text"
                      placeholder={t('Имя')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-3 w-full px-4 py-3 rounded-2xl bg-gray-50 outline-none text-lg"
                      style={{ boxShadow: 'inset 0 0 0 1px #E5E7EB' }}
                    />
                  )}

                  <p className="text-center text-sm text-gray-400 mt-4 mb-6">
                    {t('Если сообщение не пришло, позвоните нам по номеру')} 71{' '}
                    <a
                      href="tel:+998712051111"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      205 11 11
                    </a>
                  </p>

                  {submitError && (
                    <div className="mb-3 text-sm text-red-500 text-center">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!phoneReady || isLoading || !executeRecaptcha}
                    className="py-3.5 text-white font-bold text-lg text-center rounded-full w-full outline-none focus:outline-none transition-all duration-200 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        phoneReady && executeRecaptcha ? '#F9B004' : '#D1D5DB',
                    }}
                  >
                    {isLoading
                      ? '...'
                      : !executeRecaptcha
                      ? t('Загрузка защиты...')
                      : t('Получить код')}
                  </button>
                </form>
              ) : (
                <form onSubmit={onCodeSubmit}>
                  <div
                    className="flex items-center justify-center rounded-2xl px-4 py-3 bg-gray-50"
                    style={{ boxShadow: 'inset 0 0 0 1px #E5E7EB' }}
                  >
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="X X X X"
                      autoFocus
                      value={formatCode(code)}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      className="flex-1 text-lg font-medium text-center bg-transparent placeholder-gray-300 tracking-widest border-0 focus:outline-none focus:ring-0"
                      style={{
                        padding: '8px 0',
                        outline: 'none',
                        border: 'none',
                        boxShadow: 'none',
                        WebkitAppearance: 'none',
                      }}
                    />
                  </div>

                  <p className="text-center text-sm text-gray-400 mt-4 mb-6">
                    {t('Код отправлен на номер')} {savedPhone}
                  </p>

                  {submitError && (
                    <div className="mb-3 text-sm text-red-500 text-center">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-3.5 text-white font-bold text-lg text-center rounded-full w-full outline-none focus:outline-none transition-all duration-200"
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
