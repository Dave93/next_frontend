import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'

const Delivery: FC = () => {
  return (
    <>
      <div className="mb-10">
        <div className="text-3xl mb-1">
          Доставка в Chopar Pizza ежедневно с 10:00 до 03:00{' '}
        </div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
        <Image
          src="/banner.png"
          layout="responsive"
          width={1160}
          height={270}
        />
      </div>
      <div className="mb-10">
        <div className="text-2xl mb-1">Как сделать заказ в Chopar Pizza </div>
        <div className="w-[800px]">
          Достаточно просто выбрать заинтересовавшие вас блюда из меню и
          добавить их в корзину (нажимайте на кнопку с ценой рядом с каждым
          блюдом — оно будет добавлено в Ваш заказ), затем щёлкнуть по
          изображению корзины в правом верхнем углу сайта и далее следовать
          простым инструкциям по заполнению формы заказа.
        </div>
        <div className="grid grid-cols-4 mt-10">
          <div className="flex">
            <div>
              <img src="/decorOrder.png" alt="" />
            </div>
            <div className="ml-3 w-7/12">
              <div className="leading-6 text-xl ">Оформление заказа</div>
              <div className="text-xs text-gray-400">
                Делайте заказ на сайте
              </div>
            </div>
          </div>
          <div className="flex">
            <div>
              <img src="/confirmOrder.png" alt="" />
            </div>
            <div className="ml-3  w-7/12">
              <div className="leading-6 text-xl">Подтверждение заказа</div>
              <div className="text-xs text-gray-400">
                С вами свяжеться менеджер
              </div>
            </div>
          </div>
          <div className="flex">
            <div>
              <img src="/deliveryIcon.png" alt="" />
            </div>
            <div className="ml-3 w-7/12">
              <div className="leading-6 text-xl">Доставка</div>
              <div className="text-xs text-gray-400">
                Оплачываете заказ удобным для Вас способом
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="text-3xl mb-1">Зона доставки </div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
        <Image
          src="/orderZone.png"
          layout="responsive"
          width={2132}
          height={1075}
        />
        <div className="border border-yellow rounded-xl grid grid-cols-2 p-5">
          <div className="">
            <div>
              <img src="zoneA.png" />
            </div>
            <span className="text-green-500">Зона А:</span> При доставке по
            Ташкенту минимальная сумма заказа составляет 60 000 сум, среднее
            время доставки 40 минут
          </div>
          <div className="">
            <div>
              <img src="zoneB.png" />
            </div>
            <span className="text-yellow">Зона B:</span> При доставке по ТКАД
            минимальная сумма заказа составляет 100 000 сум, среднее время
            доставки – 60 минут
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="text-3xl mb-1">Способы оплаты </div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
      </div>
    </>
  )
}

export default memo(Delivery)
