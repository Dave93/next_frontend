import { FC, memo } from 'react'

const Orders: FC = () => {
  return (
    <div>
      <div className="text-2xl mt-8 mb-5">Мои заказы</div>

      <div className="border h-28  p-10 rounded-2xl text-xl">
        <div className="flex  text-base justify-between">
          <div>№ 433</div>
          <div>26 май 2021 г. 19:11</div>
          <div className="w-40">ул., Буюк Ипак Йули, Дом 95а, кв 31</div>
          <div>3 товара</div>
          <div>108 000 сум</div>
          <div className="ml-56 text-green-600">Доставлено</div>
        </div>
      </div>
    </div>
  )
}

export default memo(Orders)
