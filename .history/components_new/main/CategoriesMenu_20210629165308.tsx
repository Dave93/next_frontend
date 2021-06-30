import { FC, memo } from 'react'

const CategoriesMenu: FC = () => {
    return (
      <div className="container m-auto">
        <div className="bg-white w-full flex h-14 items-center  justify-between">
          <div className="text-base w-28 font-bold text-blue">ПИЦЦА</div>
          <div className="text-base w-28 font-bold text-blue">СЭТЫ</div>
          <div className="text-base w-28 font-bold text-blue">ЗАКУСКИ</div>
          <div className="text-base w-28 font-bold text-blue">СОУСЫ</div>
          <div className="text-base w-28 font-bold text-blue">САЛАТЫ</div>
          <div className="text-base w-28 font-bold text-blue">НАПИТКИ</div>
        </div>
      </div>
    )
}

export default memo(CategoriesMenu)
