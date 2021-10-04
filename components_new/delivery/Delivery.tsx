import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'

const Delivery: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    tr("delivery_text")
  )
}

export default memo(Delivery)
