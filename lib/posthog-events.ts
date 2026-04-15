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
