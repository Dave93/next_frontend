import { FC, memo } from 'react'
import Image from 'next/image'

const Fran: FC = () => {
  return (
    <>
      <div className="text-3xl mb-1">Франшиза</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="mb-16">
        <div className="grid grid-cols-3">
          <div className="col-span-2 text-xl">
            <div className="text-5xl text-yellow font-bold mb-10">
              Льготные условия франчайзинга на 2021 год
            </div>
            <div className="mb-6 font-bold">Открыть пиццерию</div>
            <div className="mb-6">
              Паушальный взнос - 800 000 рублей за каждый ресторан.
            </div>
            <div className="mb-6">
              Роялти - 5% от ежемесячной выручки точки в течение первого года со
              дня открытия ресторана, начиная с 13 месяца размер роялти составит
              7%.
            </div>
            <div className="mb-10">Окупаемость от 2-х лет.</div>
            <div className="mb-6 font-bold">Купить действующую пиццерию:</div>
            <div className="mb-6">
              Ознакомиться со всеми условиями франчайзинга вы можете по телефону
              71-200-42-42
            </div>
          </div>
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold mb-10">
          форматы ресторанов на выбор:
        </div>
        <div className="grid grid-cols-3">
          <div>
            <Image
              src="/bigRest.png"
              width="360"
              height="254"
              className="rounded-2xl mb-2"
            />
            <div className="text-2xl font-bold mt-7 mb-5">Большой ресторан</div>
            <div className="text-xl">
              <div className="mb-5">
                Ресторан с полноценным залом и доставкой на дом.
              </div>
              <div className="mb-5">
                Более 100 посадочных мест, возможно размещение детского игрового
                комплекса или бара с крепким алкоголем
              </div>
              <div className="mb-5"> <div className="font-bold">Площадь</div>  от 170 м²</div>
              <div>
                <div className="font-bold">Среднемесячный оборот</div> 150 000
                000 сум
              </div>
            </div>
          </div>
          <div>
            <Image
              src="/middleRest.png"
              width="360"
              height="254"
              className="rounded-2xl"
            />
          </div>
          <div>
            <Image
              src="/smallRest.png"
              width="360"
              height="254"
              className="rounded-2xl"
            />
          </div>
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold mb-10">
          О нашей пицце
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold mb-10">
          А самые главные секреты восхитительного вкуса
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold mb-10">
          форматы продукта
        </div>
      </div>
      <div className="mb-16">
        <div className="text-5xl text-yellow font-bold mb-10">
          Узнаваемый бренд
        </div>
      </div>
    </>
  )
}

export default memo(Fran)
