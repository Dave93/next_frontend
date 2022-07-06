import { FC, memo } from 'react'

const UserName: FC = () => {
  return (
    <div className="flex justify-between">
      <div className="1">
        <div className="text-3xl mb-1">Привет, Зафар!</div>
        <div className="text-xs w-80 text-gray-400">
          Это ваш личный кабинет. Здесь вы можете управлять своими заказами,
          редактировать личные данные и следить за избранными товарами
        </div>
      </div>
      <div className="2">
        
      </div>
    </div>
  )
}

export default memo(UserName)
