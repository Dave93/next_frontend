import type { Metadata } from 'next'
import DeliveryApp from '../../../components_new/delivery/DeliveryApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Доставка и оплата',
    description: 'Как сделать заказ, инструкция и дополнительная информация',
    alternates: {
      canonical: `${base}/${city}/delivery`,
      languages: {
        ru: `${base}/${city}/delivery`,
        uz: `${base}/uz/${city}/delivery`,
        en: `${base}/en/${city}/delivery`,
      },
    },
  }
}

export default function DeliveryPage() {
  return <DeliveryApp />
}
