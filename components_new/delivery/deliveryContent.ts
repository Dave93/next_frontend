export type StaticLocale = 'ru' | 'uz' | 'en'

const RU = `<p>Доставка ежедневно с 10:00 до 03:00.</p>
<p>Номер доставки: <a href="tel:+998712051111">+998 (71) 205-11-11</a></p>
<p>Оплата наличными, оплата картой, онлайн оплата.</p>
<h2 class="text-2xl font-bold mt-8 mb-3">Как сделать заказ в Chopar Pizza</h2>
<p>Достаточно просто выбрать заинтересовавшие вас блюда из меню и добавить их в корзину (нажимайте на кнопку с ценой рядом с каждым блюдом — оно будет добавлено в Ваш заказ), затем щёлкнуть по изображению корзины в правом верхнем углу сайта и далее следовать простым инструкциям по заполнению формы заказа.</p>
<p>Для доставки по Ташкенту минимальная сумма заказа составляет 44 000 сум, среднее время доставки 60 минут.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Оплата наличными</h3>
<p>Для выбора оплаты товара наличными на странице заказа необходимо выбрать пункт «Наличными при получении». Вы сможете оплатить товар в нашем пункте самовывоза или при доставке курьером, оплата осуществляется наличными курьеру в руки.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Оплата картой</h3>
<p>Для выбора оплаты товара картой при получении, на странице заказа необходимо выбрать пункт «Картой при получении». Вы сможете оплатить товар в нашем пункте самовывоза или при доставке курьером, оплата курьеру осуществляется с помощью переносного терминала оплаты.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Онлайн оплата</h3>
<p>Для выбора оплаты товара картой, на странице заказа необходимо выбрать пункт: онлайн оплата Payme, Click.</p>`

const UZ = `<p>Yetkazib berish har kuni 10:00 dan 03:00 gacha.</p>
<p>Yetkazib berish raqami: <a href="tel:+998712051111">+998 (71) 205-11-11</a></p>
<p>To'lov turlari: naqd pul, karta orqali va onlayn to'lovda amalga oshiriladi.</p>
<h2 class="text-2xl font-bold mt-8 mb-3">Chopar Pizzaga qanday buyurtma berish mumkin?</h2>
<p>Hammasi oddiy. Taomnomadan o'zingizga yoqqan taomni belgilang va savatchaga joylang. (Har bir taom yonida narx ko'rsatilgan tugmachani bosing. U sizning buyurtmangizni buyurtmalar savatchasiga joylaydi). So'ngra saytning o'ng burchagidagi savatcha tasvirini bosing va buyurtmani amalga oshirishdagi oddiy ko'rsatmalarga amal qiling.</p>
<p>Toshkent shahri bo'ylab yetkazib berish uchun minimal buyurtma 44 000 so'm, o'rtacha yetkazib berish vaqti 60 daqiqa.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Naqd to'lov</h3>
<p>To'lovni naqd pulda amalga oshirish uchun «Naqd pul» bandini tanlashingiz kerak. Siz to'lovni bizning to'lov punktimizda yoki kuryer orqali amalga oshirishingiz mumkin.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Karta orqali to'lov</h3>
<p>To'lovni karta orqali amalga oshirish uchun buyurtma sahifasida «Karta orqali» bandini tanlang. Siz to'lovni bizning to'lov punktimizda yoki kuryer orqali amalga oshira olasiz. Kuryerda to'lov terminali mavjud bo'lib, terminal orqali to'lov qilishingiz mumkin.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Onlayn to'lov</h3>
<p>Buyurtma sahifasida mahsulot uchun Payme, Click to'lov turlari ko'rsatilgan bo'lib, o'zingizda mavjud bo'lgan xizmat turini tanlashingiz kerak bo'ladi.</p>`

const EN = `<p>Delivery daily from 10:00 to 03:00.</p>
<p>Delivery number: <a href="tel:+998712051111">+998 (71) 205-11-11</a></p>
<p>Payment by cash, card or online.</p>
<h2 class="text-2xl font-bold mt-8 mb-3">How to place an order at Chopar Pizza</h2>
<p>Simply select the dishes you are interested in from the menu and add them to the basket (click on the button with the price next to each dish — it will be added to your order), then click on the basket image in the upper right corner of the site and follow the simple instructions for filling out the order form.</p>
<p>For delivery in Tashkent, the minimum order amount is 44 000 sum, the average delivery time is 60 minutes.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Cash payment</h3>
<p>To choose cash payment, select «Cash on receipt» on the order page. You can pay at our pickup point or to the courier on delivery — cash is handed directly to the courier.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Card payment</h3>
<p>To choose card-on-delivery, select «Card on receipt» on the order page. You can pay at our pickup point or to the courier on delivery; the courier carries a portable POS terminal.</p>
<h3 class="text-xl font-bold mt-6 mb-2">Online payment</h3>
<p>To pay online, select «Payme» or «Click» on the order page.</p>`

export function getDeliveryBody(locale: StaticLocale): string {
  if (locale === 'uz') return UZ
  if (locale === 'en') return EN
  return RU
}
