import { FC, memo } from 'react'

const Bonuses: FC = () => {
  return (
    <div>
      <div className="text-[26px] mt-[30px] mb-[20px]">Мои бонусы</div>
      <div className="border flex h-28 justify-between p-10 rounded-[15px]">
        <div className="font-bold">Текущий баланс</div>
        <div>0 баллов</div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
