import { getExtracted, getLocale } from 'next-intl/server'
import { getDeliveryBody, type StaticLocale } from './deliveryContent'

export default async function DeliveryApp() {
  const t = await getExtracted()
  const locale = (await getLocale()) as StaticLocale
  const body = getDeliveryBody(locale)
  return (
    <div className="mx-5 md:mx-0">
      <h1 className="text-3xl mb-1 font-bold">{t('Доставка и оплата')}</h1>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="md:grid gap-10 mb-8 prose max-w-none leading-relaxed">
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </div>
    </div>
  )
}
