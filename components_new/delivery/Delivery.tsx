import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

const Delivery: FC = () => {
  const { locale } = useRouter()
  const { t: tr } = useTranslation('common')
  return (
    <>
      <div className="mx-5 md:mx-0">
        <div className="text-3xl mb-1">{tr('delivery_pay')}</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
        <div className="md:grid gap-10 mb-8">
        <div dangerouslySetInnerHTML={{ __html: tr('delivery_text') }} />
        </div>
      </div>
    </>
  )
}

export default memo(Delivery)
