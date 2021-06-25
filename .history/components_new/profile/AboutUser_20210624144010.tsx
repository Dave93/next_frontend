import { FC, memo } from 'react'

const AboutUser: FC = () => {
  return (
    <div className="flex">
      <div className="1">
        <div>Привет, Зафар!</div>
        <div className="">
          Это ваш личный кабинет. Здесь вы можете управлять своими заказами,
          редактировать личные данные и следить за избранными товарами
        </div>
      </div>
      <div className="2"></div>
    </div>
  )
}

export default memo(AboutUser)
