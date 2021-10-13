import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

const Delivery: FC = () => {  
  const { locale } = useRouter()
  const { t: tr } = useTranslation('common')
  return (
    <>    
      <div className="mx-5 md:mx-0">
          <div className="text-3xl mb-1">{tr('delivery_pay')}</div>
          <div className="border-b-2 w-24 border-yellow mb-10"></div>
          <div className="md:grid gap-10 mb-8">
            {locale == 'ru' ? (
              <div>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Доставка ежедневно с 10:00 до 03:00.
                  </span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Телефон доставки +998971 205 11 11
                  </span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Оплата наличными, оплата картой, онлайн оплата
                  </span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>&nbsp;</span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Как сделать заказ в Chopar Pizza&nbsp;
                  </span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Достаточно просто выбрать заинтересовавшие вас блюда из меню и
                    добавить их в корзину (нажимайте на кнопку с ценой рядом с каждым
                    блюдом — оно будет добавлено в Ваш заказ), затем щёлкнуть по
                    изображению корзины в правом верхнем углу сайта и далее следовать
                    простым инструкциям по заполнению формы заказа.
                  </span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>&nbsp;</span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Доставка по Ташкенту минимальная сумма заказа составляет 44 000 UZS, среднее время доставки 60 минут
                  </span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>&nbsp;</span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <strong>
                    <span style={{ fontFamily: '"Times",serif' }}>
                      Оплата наличными
                    </span>
                  </strong>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Для выбора оплаты товара наличными на странице заказа необходимо
                    выбрать пункт "Наличными при получении". Вы сможете оплатить товар
                    в нашем пункте самовывоза или при доставке курьером, оплата
                    осуществляется наличными курьеру в руки.
                  </span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>&nbsp;</span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <strong>
                    <span style={{ fontFamily: '"Times",serif' }}>Оплата картой</span>
                  </strong>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Для выбора оплаты товара картой при получении, на странице заказа
                    необходимо выбрать пункт "Картой при получении". Вы сможете
                    оплатить товар в нашем пункте самовывоза или при доставке
                    курьером, оплата курьеру осуществляется с помощью переносного
                    терминала оплаты.
                  </span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>&nbsp;</span>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <strong>
                    <span style={{ fontFamily: '"Times",serif' }}>Онлайн оплата</span>
                  </strong>
                </p>
                <p
                  style={{
                    margin: '0cm',
                    marginBottom: '.0001pt',
                    fontSize: '16px',
                    fontFamily: '"Calibri",sans-serif',
                  }}
                >
                  <span style={{ fontFamily: '"Times",serif' }}>
                    Для выбора оплаты товара картой, на странице заказа необходимо выбрать пункт: онлайн оплата Payme, Click.
                  </span>
                </p>
              </div>
          ) : (
            <div>
              <p>Yetkazib berish har kuni 10:00 dan 03:00 gacha.</p>
              <p>Yetkazib berish telefoni +998 971 205 11 11</p>
              <p>To’lov turlari: naqd pul, karta orqali va online to’lovda amalga oshiriladi.</p>
              <p><br /></p>
              <p>Chopar Pizzaga qanday buyurtma berish mumkin?</p>
              <p>Hammasi oddiy. Taomnomadan o’zingizga yoqqan taomni belgilang va savatchaga joylang. (Har bir taom yonida narx ko’rsatilgan tugmachani bosing. U sizning buyurtmangizni buyurtmalar savatchasiga joylaydi). So’ngra saytning o’ng burchagidagi savatcha tasvirini bosing va buyurtmani amalga oshirishdagi oddiy ko’rsatmalarga amal qiling.</p>
              <p><br /></p>
              <p>Toshkent shahri bo’ylab yetkazib berish uchun minimal buyurtma 44 000 so’m, o’rtacha yetkazib berish vaqti 60 daqiqa.</p>
              <p><br /></p>
              <p>Naqd to'lov</p>
              <p>To’lovni naqd pulda amalga oshirish uchun “Naqd pul” bandini tanlashingiz kerak. Siz to’lovni bizning to’lov punktimizda yoki kuryer orqali amalga oshirishingiz mumkin.</p>
              <p><br /></p>
              <p>Karta orqali to'lov</p>
              <p>To’lovni karta orqali amalga oshirish uchun buyurtma sahifasida “Karta orqali” bandini tanlang. Siz to’lovni bizning to’lov punktimizda yoki kuryer orqali amalga oshira olasiz. Kuryerda to’lov terminali mavjud bo’lib, terminal orqali to’lov qilishingiz mumkin.</p>
              <p><br /></p>
              <p>Onlayn to'lov</p>
              <p>Buyurtma sahifasida mahsulot uchun Payme, Click to’lov turlari ko’rsatilgan bo’lib, o’zingizda mavjud bo’lgan xizmat turini tanlashingiz kerak bo’ladi.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default memo(Delivery)
