import { FC, memo } from 'react'

const Fran: FC = () => {
  return (
    <>
      <div className="text-3xl mb-1">Франшиза</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
          <div className="mb-16">
              <div className="grid grid-cols-3">

        <div className="text-5xl text-yellow font-bold w-6/12">
          Льготные условия франчайзинга на 2021 год
        </div>
        <div>Открыть пиццерию</div>
        <div>Паушальный взнос - 800 000 рублей за каждый ресторан.</div>
        <div>
          Роялти - 5% от ежемесячной выручки точки в течение первого года со дня
          открытия ресторана, начиная с 13 месяца размер роялти составит 7%.
        </div>
        <div>Окупаемость от 2-х лет.</div>
              </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold w-6/12">
          форматы ресторанов на выбор:
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold w-6/12">
          О нашей пицце
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold w-6/12">
          А самые главные секреты восхитительного вкуса
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold w-6/12">
          форматы продукта
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold w-6/12">
          Узнаваемый бренд
        </div>
      </div>
    </>
  )
}

export default memo(Fran)
