import { FC, memo } from "react"


const Fran: FC = () => {
    return (
      <>
        <div className="mb-16">
          <div className="text-5xl text-yellow">Льготные условия франчайзинга на 2021 год</div>
        </div>
        <div className="mb-16">
          <div className="text-5xl text-yellow">форматы ресторанов на выбор:</div>
        </div>
        <div className="mb-16">
          <div className="text-5xl text-yellow">О нашей пицце</div>
        </div>
        <div className="mb-16">
          <div className="text-5xl text-yellow">А самые главные секреты восхитительного вкуса</div>
        </div>
        <div className="mb-16">
          <div className="text-5xl text-yellow">форматы продукта</div>
        </div>
        <div className="mb-16">
          <div className="text-5xl text-yellow">Узнаваемый бренд</div>
        </div>
      </>
    )
}

export default memo(Fran)