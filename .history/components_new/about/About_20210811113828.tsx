import useTranslation from 'next-translate/useTranslation'
import { FC, memo } from 'react'

const About: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      <div className="text-3xl mb-1">
        {tr("about")}
      </div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
    </>
  )
}

export default memo(About)
