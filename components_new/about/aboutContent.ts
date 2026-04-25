export type StaticLocale = 'ru' | 'uz' | 'en'

const RU = `<p><strong>ВКУС, КОТОРЫЙ ОБЪЕДИНЯЕТ</strong></p>
<p>Наливные пунцовые помидоры и душистый лук, первосортная говядина и конина, лучшие специи, разливающиеся вкусами лета и солнца — с 2015 года команда Chopar блистательно доказывает, что в руках профессионалов традиционные восточные продукты способны перевоплощаться в пиццу, которая покоряет сердца истовых гурманов.</p>
<p>В переводе с узбекского Chopar — «гонец». Вот уже восемь лет сеть пиццерий Chopar подтверждает этот статус не только скоростью доставки пиццы с восточным акцентом из печи прямо к дверям вашего дома, но и уверенно чувствует себя в роли гонца, который приносит добрые вести и вкусы на стыке восточных ценностей, европейских гастрономических традиций и ультрасовременных технологий.</p>
<p>Бренд Chopar Pizza — представляет потребителям собственное видение формата пиццерий — кафе, в которых традиционное итальянское блюдо превращается в королевские почести, приготовленные из даров южной природы и щедро приправленные восточным гостеприимством.</p>`

const UZ = `<p>Chopar brendi — O'zbekistondagi eng yaxshi pitseriyalar tarmog'i maqomi uchun kurashmoqda va hozirgi paytda mamlakatimizda 20 dan ortiq filiallariga ega. Chopar — sharqona qadriyatlar va zamonaviy an'analar uyg'unligidir. Choparning oilaviy pitsasi — oila va do'stlar davrasida vaqt o'tkazish uchun yaxshigina sabab. 9 yil ichida Chopar iqtidorlilar qadrlanadigan va muvaffaqiyatli insonlar yetishib chiqadigan katta oilaga aylandi. Bizni sifat va an'analarga bo'lgan nozik yondashuv uchun yaxshi ko'rishadi. Biz har bir mijozimizni qadrlaymiz, standartlarni saqlagan holda yildan-yilga yanada mukammal bo'lishga intilamiz.</p>`

const EN = `<p><strong>TASTE THAT UNITES</strong></p>
<p>Poured crimson tomatoes and fragrant onions, first-class beef and horsemeat, the best spices bursting with flavors of summer and sun — since 2015, the Chopar team has brilliantly proved that in the hands of professionals, traditional oriental products are capable of transforming into pizza that wins the hearts of ardent gourmets.</p>
<p>Translated from Uzbek, Chopar means «messenger». For more than eight years now the Chopar pizzeria network has confirmed this status not only by the speed of delivering oven-fresh pizza with an oriental accent right to the doors of your home, but also feels confident in the role of a messenger who brings good news and tastes at the intersection of Eastern values, European gastronomic traditions and cutting-edge technologies.</p>
<p>The Chopar Pizza brand presents to consumers its own vision of the pizzeria format — cafés in which a traditional Italian dish turns into royal hospitality, prepared from the gifts of southern nature and generously seasoned with oriental warmth.</p>`

export function getAboutBody(locale: StaticLocale): string {
  if (locale === 'uz') return UZ
  if (locale === 'en') return EN
  return RU
}
