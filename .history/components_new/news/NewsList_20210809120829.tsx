import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import Pic from '/public/delivery.png'

const NewsList: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      <div className="flex">
        <div className="flex">
          <Image src={Pic} width="400" height="400" />
          asdsad
        </div>
      </div>
    </>
  )
}

export default memo(NewsList)
