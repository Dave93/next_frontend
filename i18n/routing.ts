import { defineRouting } from 'next-intl/routing'

// Wave 1: localePrefix 'never' — без URL префиксов локалей.
// Causes: Next.js не позволяет [locale] (App) и [city] (Pages) сосуществовать
// на одном URL уровне ("different slug names for the same dynamic path").
// Локаль определяется через cookie/Accept-Language до миграции pages/[city]/.
//
// В Wave 5/6 после удаления pages/[city]/ переключаем на 'as-needed'
// и переструктурируем app/ под [locale] сегмент для сохранения /uz/, /en/ URL'ов.
export const routing = defineRouting({
  locales: ['ru', 'uz', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'never',
})
