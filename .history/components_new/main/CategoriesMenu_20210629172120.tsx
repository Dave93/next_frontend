import { FC, memo } from 'react'

const CategoriesMenu: FC<{ categories: any }> = (categories) => {
  console.log(categories)
  return (
    <div className="fixed left-0 m-auto right-0 top-0 z-30">
      <div className="container m-auto">
        <div className="bg-white flex h-14 items-center justify-between px-36 rounded-xl shadow-lg w-full">
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            ПИЦЦА
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            СЭТЫ
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            ЗАКУСКИ
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            СОУСЫ
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            САЛАТЫ
          </div>
          <div className="font-bold text-base text-center text-secondary uppercase w-28">
            НАПИТКИ
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(CategoriesMenu)
