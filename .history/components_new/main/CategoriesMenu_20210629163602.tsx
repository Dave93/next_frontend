import { FC, memo } from 'react'

const CategoriesMenu: FC = () => {
  return (
    <div>
      <div className="text-sm">ПИЦЦА</div>
      <div className="text-sm">СЭТЫ</div>
      <div className="text-sm">ЗАКУСКИ</div>
      <div className="text-sm">СОУСЫ</div>
      <div className="text-sm">ПИСАЛАТЫЦЦА</div>
      <div className="text-sm">НАПИТКИ</div>
    </div>
  )
}

export default memo(CategoriesMenu)
