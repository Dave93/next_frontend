import useTranslation from 'next-translate/useTranslation'
import { FC, memo } from 'react'
import Image from 'next/image'

const About: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    tr('about_text')
  )
}

export default memo(About)
