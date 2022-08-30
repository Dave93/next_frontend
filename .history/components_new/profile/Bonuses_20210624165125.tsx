import { FC, memo } from 'react'

const Bonuses: FC = () => {
  return (
    <div>
      <div>Мои бонусы</div>
      <div className="h-28 border rounded-[15px]">
        <div>Текущий баланс</div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
