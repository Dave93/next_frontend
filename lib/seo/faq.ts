import type { FaqItem } from '@components_new/seo/FaqJsonLd'

export const DELIVERY_FAQ: Record<'ru' | 'uz' | 'en', FaqItem[]> = {
  ru: [
    {
      question: 'Сколько идёт доставка?',
      answer:
        'Среднее время доставки — 30–45 минут с момента подтверждения заказа. В часы пик возможна задержка до 60 минут. Точное время покажем при оформлении.',
    },
    {
      question: 'Бесплатная ли доставка?',
      answer:
        'Да, доставка бесплатная по всем районам Ташкента и в зонах работы пиццерий в других городах Узбекистана.',
    },
    {
      question: 'Какие способы оплаты доступны?',
      answer:
        'Наличными курьеру, картой курьеру через POS-терминал, онлайн картами Uzcard, Humo, Visa и MasterCard.',
    },
    {
      question: 'Можно ли заказать самовывоз?',
      answer:
        'Да, при оформлении заказа выберите «Самовывоз» и удобную пиццерию. Готовый заказ можно забрать в течение 20–30 минут.',
    },
    {
      question: 'Халяль ли продукция?',
      answer:
        'Да, вся продукция Chopar Pizza халяль-сертифицирована: мясо, колбасы, ингредиенты соответствуют нормам шариата.',
    },
    {
      question: 'Когда работает пиццерия?',
      answer: 'Ежедневно с 10:00 до 03:00 (по ташкентскому времени).',
    },
  ],
  uz: [
    {
      question: 'Yetkazib berish qancha vaqt oladi?',
      answer:
        'Buyurtma tasdiqlanganidan boshlab oʼrtacha 30–45 daqiqa. Pik soatlarida 60 daqiqagacha kechikish mumkin. Aniq vaqt buyurtma rasmiylashtirilganda koʼrsatiladi.',
    },
    {
      question: 'Yetkazib berish bepulmi?',
      answer:
        'Ha, Toshkent va Oʼzbekistonning boshqa shaharlaridagi pitseriya zonalari boʼyicha yetkazib berish bepul.',
    },
    {
      question: 'Qanday toʼlov usullari mavjud?',
      answer:
        'Naqd kuryerga, POS-terminal orqali kuryerga, Uzcard, Humo, Visa va MasterCard kartalari bilan onlayn.',
    },
    {
      question: 'Olib ketish mumkinmi?',
      answer:
        'Ha, buyurtma rasmiylashtirilganda «Olib ketish»ni tanlang va qulay pitseriyani belgilang. Tayyor buyurtmani 20–30 daqiqada olishingiz mumkin.',
    },
    {
      question: 'Mahsulotlar halolmi?',
      answer:
        'Ha, Chopar Pizza barcha mahsulotlari halol sertifikatlangan: goʼsht, kolbasa va ingredientlar shariat normalariga mos.',
    },
    {
      question: 'Pitseriya qachon ishlaydi?',
      answer: 'Har kuni soat 10:00 dan 03:00 gacha (Toshkent vaqti).',
    },
  ],
  en: [
    {
      question: 'How long does delivery take?',
      answer:
        'Average delivery time is 30–45 minutes from order confirmation. During peak hours, expect up to 60 minutes. Exact time is shown at checkout.',
    },
    {
      question: 'Is delivery free?',
      answer:
        'Yes, delivery is free across all districts of Tashkent and within service zones in other Uzbekistan cities.',
    },
    {
      question: 'Which payment methods are accepted?',
      answer:
        'Cash to courier, card via POS terminal, or online with Uzcard, Humo, Visa and MasterCard.',
    },
    {
      question: 'Can I pick up my order?',
      answer:
        'Yes — select "Pickup" at checkout and choose a convenient pizzeria. The order is ready in 20–30 minutes.',
    },
    {
      question: 'Is your food halal?',
      answer:
        'Yes, all Chopar Pizza products are halal-certified: meat, sausages and other ingredients comply with Sharia.',
    },
    {
      question: 'What are your business hours?',
      answer: 'Daily from 10:00 to 03:00 (Tashkent time).',
    },
  ],
}
