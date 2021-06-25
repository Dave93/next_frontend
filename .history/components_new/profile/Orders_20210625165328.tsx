import { FC, memo } from 'react';

const Orders: FC = () => {
    return (
      <div>
        <div className="text-2xl mt-8 mb-5">Мои заказы</div>

        <div className="border flex h-28 justify-between p-10 rounded-2xl text-xl">
          <div className="flex flex-row text-base ">
            <div>№ 433</div>
            <div>26 май 2021 г. 19:11</div>
            <div>ул., Буюк Ипак Йули, Дом 95а, кв 31</div>
            <div>3 товара</div>
            <div>108 000 сум</div>
            <div >Доставлено</div>
          </div>
        </div>
      </div>
    )
}

export default memo(Orders);