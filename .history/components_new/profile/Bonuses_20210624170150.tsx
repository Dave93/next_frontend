import { FC, memo } from 'react'

const Bonuses: FC = () => {
  return (
    <div>
      <div className="text-3xl mt-[30px] mb-[20px]">Мои бонусы</div>
      <div className="h-28 border rounded-[15px]">
        <div>Текущий баланс</div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
