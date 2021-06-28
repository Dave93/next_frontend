import { FC, memo } from 'react';

const Orders: FC = () => {
    return (
      <div>
        <div className="text-[26px] mt-[30px] mb-[20px]">Мои заказы</div>

        <div className="border flex h-28 justify-between p-10 rounded-[15px] text-xl">
          <div className="flex flex-row ...">
            <div>1</div>
            <div>2</div>
            <div>3</div>
          </div>
        </div>
      </div>
    )
}

export default memo(Orders);