/**
 * Auth token (`opt_token`) access helpers.
 *
 * The token is written to BOTH a 30-day cookie and a (never-expiring)
 * localStorage mirror at login. Most API callers historically read only the
 * cookie, so once the cookie lapsed (>30 days, cleared, or blocked) the
 * request went out unauthenticated and the backend replied 401/403 — even
 * though the persisted user store still showed the user as logged in.
 *
 * `getOptToken` falls back to the localStorage mirror; `syncOptTokenCookie`
 * restores the cookie from that mirror on app start so every cookie-based
 * reader keeps working.
 */

import Cookies from 'js-cookie'

const KEY = 'opt_token'

export function getOptToken(): string | null {
  const cookieTok = Cookies.get(KEY)
  if (cookieTok) return cookieTok
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(KEY) || null
  } catch {
    return null
  }
}

/**
 * If the cookie lapsed but localStorage still holds the token, restore the
 * cookie (same 30-day window). Call once on app start before any API call.
 */
export function syncOptTokenCookie(): void {
  if (typeof window === 'undefined') return
  try {
    const cookieTok = Cookies.get(KEY)
    const lsTok = localStorage.getItem(KEY)
    if (!cookieTok && lsTok) {
      Cookies.set(KEY, lsTok, { expires: 30 })
    }
  } catch {}
}
