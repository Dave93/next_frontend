import { getLocale } from 'next-intl/server'
import { getDeleteAccountBody, type StaticLocale } from './deleteAccountContent'

export default async function DeleteAccountApp() {
  const raw = (await getLocale()) as string
  const locale: StaticLocale = raw === 'uz' || raw === 'en' ? raw : 'ru'
  const body = getDeleteAccountBody(locale)
  return (
    <div className="mx-5 md:mx-0 max-w-none">
      <div lang={locale} dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  )
}
