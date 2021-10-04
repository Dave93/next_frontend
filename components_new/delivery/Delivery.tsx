import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

const Delivery: FC = () => {  
  const { locale } = useRouter()
  const { t: tr } = useTranslation('common')
  return (
    <>
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
              Зона А:&nbsp;При доставке по Ташкенту минимальная сумма заказа
              составляет 60&nbsp;000 сум, среднее время доставки 40 минут
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
              Зона B: при доставке по ТКАД минимальная сумма заказа составляет
              100 000 сум, среднее время доставки – 60 минут
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
              Для выбора оплаты товара картой при получении, на странице заказа
              необходимо выбрать пункт онлайн оплата Pay-me, Click. Вы сможете
              оплатить товар в нашем пункте самовывоза или при доставке
              курьером, оплата курьеру осуществляется с помощью переносного
              терминала оплаты.
            </span>
          </p>
        </div>
      ) : (
        <div>
        <p>Yetkazib berish har kuni 10:00 dan 03:00 gacha.</p>
        <p>Yetkazib berish telefoni +998 971 205 11 11</p>
        <p>Naqd to'lov, karta orqali to'lash, onlayn to'lov</p>
        <p><br /></p>
        <p><br /></p>
        <p>Chopar Pizza -ga qanday buyurtma berish mumkin</p>
        <p>Siz menyudan o'zingizni qiziqtirgan taomlarni tanlab, ularni savatga qo'shishingiz kerak (har bir taom yonidagi narxi ko'rsatilgan tugmani bosing - bu sizning buyurtmangizga qo'shiladi), so'ngra savat tasvirini bosing. saytning o'ng yuqori burchagini bosing va keyin ariza to'ldirish bo'yicha oddiy ko'rsatmalarga amal qiling.</p>
        <p><br /></p>
        <p>A zonasi: Toshkentda etkazib berish uchun minimal buyurtma miqdori 60 000 so'm, etkazib berishning o'rtacha vaqti 40 minut</p>
        <p><br /></p>
        <p>B zonasi: TKAD orqali etkazib berish uchun minimal buyurtma miqdori 100 000 so'm, etkazib berishning o'rtacha vaqti 60 minut.</p>
        <p><br /></p>
        <p>Naqd to'lov</p>
        <p>Buyurtma sahifasida tovarlar uchun naqd pul to'lashni tanlash uchun siz "Qabul qilingan pul" bandini tanlashingiz kerak. Siz tovarlarni bizning qabul qilish punktimizda yoki kurer orqali etkazib berishda to'lashingiz mumkin, to'lov qo'lda kurerga naqd pulda amalga oshiriladi.</p>
        <p><br /></p>
        <p>Karta orqali to'lov</p>
        <p>Tovarlarni qabul qilishda karta orqali to'lovni tanlash uchun, buyurtma sahifasida "Qabul qilingan paytdagi karta" bandini tanlang. Siz tovarlarni bizning qabul qilish punktimizda yoki kurer orqali etkazib berishda to'lashingiz mumkin, kurerga to'lov ko'chma to'lov terminali yordamida amalga oshiriladi.</p>
        <p><br /></p>
        <p>Onlayn to'lov</p>
        <p>Tovarlarni karta orqali qabul qilishda to'lovni tanlash uchun, buyurtma sahifasida siz "Pay-me, to'lov" onlayn-to'lovini tanlashingiz kerak. Siz tovarlarni bizning qabul qilish punktimizda yoki kurer orqali etkazib berishda to'lashingiz mumkin, kurerga to'lov ko'chma to'lov terminali yordamida amalga oshiriladi.</p>
      </div>
      )}
    </>
  )
}

export default memo(Delivery)
