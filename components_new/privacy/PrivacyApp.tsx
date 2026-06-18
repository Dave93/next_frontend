import { getLocale } from 'next-intl/server'
import { getPrivacyBody, type StaticLocale } from './privacyContent'

export default async function PrivacyApp() {
  const raw = (await getLocale()) as string
  const locale: StaticLocale = raw === 'uz' || raw === 'en' ? raw : 'ru'
  const body = getPrivacyBody(locale)
  return (
    <div className="mx-5 md:mx-0 max-w-none">
      <div lang={locale} dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  )
}
