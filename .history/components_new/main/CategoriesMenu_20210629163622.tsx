import { FC, memo } from 'react'

const CategoriesMenu: FC = () => {
  return (
    <div>
      <div className="text-base">ПИЦЦА</div>
      <div className="text-base">СЭТЫ</div>
      <div className="text-base">ЗАКУСКИ</div>
      <div className="text-base">СОУСЫ</div>
      <div className="text-base">ПИСАЛАТЫЦЦА</div>
      <div className="text-base">НАПИТКИ</div>
    </div>
  )
}

export default memo(CategoriesMenu)
