import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'

const Delivery: FC = () => {
  return (
    <>
      <div className="mb-10">
        <div className="text-3xl mb-1">
          Доставка в Chopar Pizza ежедневно с 10:00 до 03:00{' '}
        </div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
        <Image
          src="/banner.png"
          layout="responsive"
          width={1160}
          height={270}
        />
      </div>
      <div className="mb-10">
        <div className="text-2xl mb-1">Как сделать заказ в Chopar Pizza </div>
      </div>
      <div className="mb-10">
        <div className="text-2xl mb-1">Зона доставки </div>
      </div>
      <div className="mb-10">
        <div className="text-2xl mb-1">Способы оплаты </div>
      </div>
    </>
  )
}

export default memo(Delivery)
