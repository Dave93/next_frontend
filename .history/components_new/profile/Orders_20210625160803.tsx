import { FC, memo } from 'react';

const Orders: FC = () => {
    return (
      <div>
        <div className="text-[26px] mt-[30px] mb-[20px]">Мои заказы</div>

        <div className="border flex h-28 justify-between p-10 rounded-[15px] text-xl">
          <div className="flex flex-row text-base ">
            <div className="flex-initial">№ 433</div>
            <div className="flex-initial">26 май 2021 г. 19:11</div>
            <div className="flex-initial">ул., Буюк Ипак Йули, Дом 95а, кв 31</div>
            <div className="flex-initial">3 товара</div>
            <div className="flex-initial">108 000 сум</div>
          </div>
        </div>
      </div>
    )
}

export default memo(Orders);