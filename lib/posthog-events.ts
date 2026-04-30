import posthog from 'posthog-js'

/**
 * PostHog Custom Events — Chopar Pizza
 *
 * Все аналитические события для отслеживания пути клиента.
 * Silent fail — никогда не ломаем UX из-за аналитики.
 */

const trackEvent = (event: string, properties?: Record<string, any>) => {
  try {
    posthog.capture(event, properties)
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog capture failed:', e)
    }
  }
}

// ─── Product ────────────────────────────────────────────

export const trackProductViewed = (data: {
  product_id: string | number
  product_name: string
  category?: string
  price?: number
  city?: string
}) => trackEvent('product_viewed', data)

export const trackAddToCart = (data: {
  product_id: string | number
  product_name: string
  variant_id?: string | number
  quantity: number
  price?: number
  cart_total?: number
  cart_items_count?: number
  city?: string
}) => trackEvent('add_to_cart', data)

export const trackRemoveFromCart = (data: {
  product_id: string | number
  product_name: string
  cart_total?: number
  cart_items_count?: number
}) => trackEvent('remove_from_cart', data)

// ─── Cart & Checkout ────────────────────────────────────

export const trackCartViewed = (data: {
  cart_items_count: number
  cart_total: number
  city?: string
}) => trackEvent('cart_viewed', data)

export const trackCheckoutStarted = (data: {
  cart_items_count: number
  cart_total: number
  city?: string
  delivery_type?: string
}) => trackEvent('checkout_started', data)

// ─── Order ──────────────────────────────────────────────

export const trackOrderPlaced = (data: {
  order_id: string
  order_total: number
  items_count: number
  pay_type: string
  delivery_type?: string
  city?: string
  source_type?: string
  has_discount?: boolean
}) => trackEvent('order_placed', data)

export const trackOrderFailed = (data: {
  error_message: string
  error_code?: string
  cart_total?: number
  items_count?: number
}) => trackEvent('order_failed', data)

// ─── Auth & Identity ───────────────────────────────────

export const identifyUser = (
  userId: string | number,
  properties?: {
    phone_masked?: string
    is_new_user?: boolean
    registration_source?: string
  }
) => {
  try {
    posthog.identify(String(userId))
    if (properties) {
      posthog.setPersonProperties(properties)
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog identify failed:', e)
    }
  }
}

export const trackUserRegistered = (data: {
  source?: string
}) => trackEvent('user_registered', data)

// ─── OTP funnel ─────────────────────────────────────────
//
// Per-stage OTP tracking. The backend can confirm `enter` / `captcha_*` /
// `otpmanager_result` / `verify_result`, but it can NOT see what happens
// before the request leaves the browser. PostHog showed people clicking
// "Получить код" 7-13 times while the server saw zero retries — meaning
// the click never made it to a real fetch. These events expose the gap:
// recaptcha hang, network drop, or duplicate-click on a disabled button.
//
// `phone_masked` keeps PII out of PostHog while still letting us join
// frontend funnel with backend logs (which mask the same way).

const maskPhoneForTrack = (raw: string): string => {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.length < 9) return ''
  return '+' + digits.slice(0, 5) + '***' + digits.slice(-4)
}

export const trackOtpSubmitClicked = (data: {
  phone: string
  is_loading: boolean
  attempt: number
}) =>
  trackEvent('otp_submit_clicked', {
    phone_masked: maskPhoneForTrack(data.phone),
    is_loading: data.is_loading,
    attempt: data.attempt,
  })

export const trackOtpRecaptchaStarted = (data: {
  phone: string
  attempt: number
}) =>
  trackEvent('otp_recaptcha_started', {
    phone_masked: maskPhoneForTrack(data.phone),
    attempt: data.attempt,
  })

export const trackOtpRecaptchaSuccess = (data: {
  phone: string
  attempt: number
  duration_ms: number
  token_length: number
}) =>
  trackEvent('otp_recaptcha_success', {
    phone_masked: maskPhoneForTrack(data.phone),
    attempt: data.attempt,
    duration_ms: data.duration_ms,
    token_length: data.token_length,
  })

export const trackOtpRecaptchaFailed = (data: {
  phone: string
  attempt: number
  duration_ms: number
  reason: 'timeout' | 'not_ready' | 'reject' | 'empty_token'
  error_message?: string
}) =>
  trackEvent('otp_recaptcha_failed', {
    phone_masked: maskPhoneForTrack(data.phone),
    attempt: data.attempt,
    duration_ms: data.duration_ms,
    reason: data.reason,
    error_message: data.error_message,
  })

export const trackOtpRequestSent = (data: {
  phone: string
  attempt: number
}) =>
  trackEvent('otp_request_sent', {
    phone_masked: maskPhoneForTrack(data.phone),
    attempt: data.attempt,
  })

export const trackOtpRequestResponded = (data: {
  phone: string
  attempt: number
  duration_ms: number
  outcome: 'success' | 'name_required' | 'other_error'
  backend_error?: string
}) =>
  trackEvent('otp_request_responded', {
    phone_masked: maskPhoneForTrack(data.phone),
    attempt: data.attempt,
    duration_ms: data.duration_ms,
    outcome: data.outcome,
    backend_error: data.backend_error,
  })

export const trackOtpRequestError = (data: {
  phone: string
  attempt: number
  duration_ms: number
  status?: number
  error_message?: string
}) =>
  trackEvent('otp_request_error', {
    phone_masked: maskPhoneForTrack(data.phone),
    attempt: data.attempt,
    duration_ms: data.duration_ms,
    status: data.status,
    error_message: data.error_message,
  })

export const trackOtpCodeSubmitClicked = (data: {
  phone: string
  code_length: number
}) =>
  trackEvent('otp_code_submit_clicked', {
    phone_masked: maskPhoneForTrack(data.phone),
    code_length: data.code_length,
  })

export const trackOtpVerified = (data: {
  phone: string
  duration_ms: number
}) =>
  trackEvent('otp_verified', {
    phone_masked: maskPhoneForTrack(data.phone),
    duration_ms: data.duration_ms,
  })

export const trackOtpVerifyFailed = (data: {
  phone: string
  duration_ms: number
  reason: 'wrong_code' | 'network_error'
  error_message?: string
}) =>
  trackEvent('otp_verify_failed', {
    phone_masked: maskPhoneForTrack(data.phone),
    duration_ms: data.duration_ms,
    reason: data.reason,
    error_message: data.error_message,
  })
