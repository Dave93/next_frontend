import { defineRouting } from 'next-intl/routing'

// Prod parity: ru без префикса, uz/en — c префиксом (/uz, /en).
// Без реструктуризации app/[city] → app/[locale]/[city] (огромный refactor)
// мы реализуем это руками в proxy.ts: strip /uz, /en из pathname и
// проставляем NEXT_LOCALE cookie. next-intl Link при `as-needed` сам
// добавит префикс к ссылкам исходя из активной локали.
export const routing = defineRouting({
  locales: ['ru', 'uz', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed',
})
