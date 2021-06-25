import { FC, memo } from 'react'

const Bonuses: FC = () => {
  return (
    <div>
      <div className="text-[26px] mt-[30px] mb-[20px]">Мои бонусы</div>
      <div className="h-28 border rounded-[15px] p-10">
        <div className="font-bold">Текущий баланс</div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
