import { FC, memo } from 'react'

const Bonuses: FC = () => {
  return (
    <div>
      <div>Мои бонусы</div>
      <div className="h-28">
        <div>Текущий баланс</div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
