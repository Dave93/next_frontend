import { FC, memo } from 'react'

const CategoriesMenu: FC = () => {
    return (
      <div className="container m-auto">
        <div className="bg-white w-full flex h-14 items-center  justify-between">
          <div className="text-base w-28">ПИЦЦА</div>
          <div className="text-base w-28">СЭТЫ</div>
          <div className="text-base w-28">ЗАКУСКИ</div>
          <div className="text-base w-28">СОУСЫ</div>
          <div className="text-base w-28">ПИСАЛАТЫЦЦА</div>
          <div className="text-base w-28">НАПИТКИ</div>
        </div>
      </div>
    )
}

export default memo(CategoriesMenu)
