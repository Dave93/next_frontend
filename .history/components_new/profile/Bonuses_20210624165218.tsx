import { FC, memo } from 'react'

const Bonuses: FC = () => {
  return (
    <div>
      <div className="text-3xl mb-1">Мои бонусы</div>
      <div className="h-28 border rounded-[15px]">
        <div>Текущий баланс</div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
