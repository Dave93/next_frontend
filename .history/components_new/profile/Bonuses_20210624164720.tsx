import { FC, memo } from 'react'

const Bonuses: FC = () => {
  return (
    <div>
      <div>Мои бонусы</div>
      <div>
        <div>Текущий баланс</div>
      </div>
    </div>
  )
}

export default memo(Bonuses)
