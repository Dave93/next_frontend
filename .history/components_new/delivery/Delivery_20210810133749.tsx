import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'

const Delivery: FC = () => {
    return (
      <>
            <div>Доставка в Chopar Pizza ежедневно с 10:00 до 03:00 </div>
            <Image src="/banner.png" width="300" height="300" layout="responsive"/>
      </>
    )
}

export default memo(Delivery)