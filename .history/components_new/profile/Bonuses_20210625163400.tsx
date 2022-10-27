import { FC, memo } from 'react'

const Bonuses: FC = () => {
  return (
    <div>
      <div className="text-2xl mt-8 mb-[20px]">Мои бонусы</div>
      <div className="border flex h-28 justify-between p-10 rounded-[15px] text-xl">
        <div className="font-bold">Текущий баланс</div>
        <div className="text-yellow">0 баллов</div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
