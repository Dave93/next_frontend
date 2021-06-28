import { FC, memo } from 'react'

const AboutUser: FC = () => {
  return (
    <div className="flex">
      <div className="1">
        <div className="text-3xl">Привет, Зафар!</div>
        <div className="text-xs w-80">
          Это ваш личный кабинет. Здесь вы можете управлять своими заказами,
          редактировать личные данные и следить за избранными товарами
        </div>
      </div>
      <div className="2"><ul><li>asdasd</li></ul></div>
    </div>
  )
}

export default memo(AboutUser)
