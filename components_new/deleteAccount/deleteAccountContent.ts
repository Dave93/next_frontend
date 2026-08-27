export type StaticLocale = 'ru' | 'uz' | 'en'

// Public account-deletion pathway required by Google Play's User Data policy:
// reachable without signing in and without installing the app.
// RU is the source of record; UZ and EN are translations of the same document.

const SUPPORT_PHONE = '71 205 11 11'
const SUPPORT_PHONE_TEL = '+998712051111'
const SUPPORT_EMAIL = 'info@choparpizza.uz'
const SUPPORT_TELEGRAM = 'https://t.me/choparhelpbot'

const RU = `
<h1>Удаление аккаунта Chopar Pizza</h1>

<p>
  Эта страница объясняет, как удалить аккаунт в приложении Chopar Pizza и связанные
  с ним данные. Оператор данных — ООО «Chopar delivery».
</p>

<h2>Способ 1. В приложении</h2>
<ol>
  <li>Откройте приложение Chopar Pizza и войдите в свой аккаунт.</li>
  <li>Перейдите в раздел «Профиль».</li>
  <li>Нажмите «Удалить аккаунт» и подтвердите действие.</li>
</ol>

<h2>Способ 2. Запрос без приложения</h2>
<p>
  Если приложение не установлено или доступ к аккаунту утерян, отправьте запрос на
  удаление любым из способов ниже. Укажите номер телефона, на который зарегистрирован
  аккаунт — он нужен, чтобы найти аккаунт и убедиться, что запрос исходит от его владельца.
</p>
<ul>
  <li>Телефон: <a href="tel:${SUPPORT_PHONE_TEL}">${SUPPORT_PHONE}</a></li>
  <li>Электронная почта: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></li>
  <li>Telegram: <a href="${SUPPORT_TELEGRAM}" rel="noopener noreferrer" target="_blank">@choparhelpbot</a></li>
</ul>
<p>Запросы обрабатываются в течение 30 дней с момента обращения.</p>

<h2>Какие данные удаляются</h2>
<ul>
  <li>Профиль: имя, номер телефона, адрес электронной почты;</li>
  <li>сохранённые адреса доставки;</li>
  <li>содержимое корзины и история просмотров;</li>
  <li>привязка аккаунта к устройствам и push-уведомлениям.</li>
</ul>

<h2>Какие данные сохраняются и почему</h2>
<p>
  Сведения о выполненных заказах (дата, состав, сумма, способ оплаты) хранятся в течение
  срока, установленного налоговым и бухгалтерским законодательством Республики Узбекистан.
  Это требование закона, и оно действует независимо от удаления аккаунта. Такие записи
  отделяются от профиля и не используются для связи с вами.
</p>

<h2>Важно</h2>
<p>
  Удаление аккаунта необратимо. Восстановить историю заказов, сохранённые адреса и
  накопленные бонусы после удаления невозможно.
</p>

<p>
  Подробнее о том, какие данные мы собираем и как их обрабатываем — в
  <a href="/tashkent/privacy">Политике конфиденциальности</a>.
</p>
`

const UZ = `
<h1>Chopar Pizza akkauntini o'chirish</h1>

<p>
  Ushbu sahifada Chopar Pizza ilovasidagi akkauntni va u bilan bog'liq ma'lumotlarni
  qanday o'chirish tushuntirilgan. Ma'lumotlar operatori — «Chopar delivery» MChJ.
</p>

<h2>1-usul. Ilova orqali</h2>
<ol>
  <li>Chopar Pizza ilovasini oching va akkauntingizga kiring.</li>
  <li>«Profil» bo'limiga o'ting.</li>
  <li>«Akkauntni o'chirish» tugmasini bosing va amalni tasdiqlang.</li>
</ol>

<h2>2-usul. Ilovasiz so'rov yuborish</h2>
<p>
  Agar ilova o'rnatilmagan bo'lsa yoki akkauntga kirish imkoni yo'qolgan bo'lsa, quyidagi
  usullardan biri orqali o'chirish so'rovini yuboring. Akkaunt ro'yxatdan o'tkazilgan
  telefon raqamini ko'rsating — u akkauntni topish va so'rov egasidan kelganini
  tasdiqlash uchun kerak.
</p>
<ul>
  <li>Telefon: <a href="tel:${SUPPORT_PHONE_TEL}">${SUPPORT_PHONE}</a></li>
  <li>Elektron pochta: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></li>
  <li>Telegram: <a href="${SUPPORT_TELEGRAM}" rel="noopener noreferrer" target="_blank">@choparhelpbot</a></li>
</ul>
<p>So'rovlar murojaat qilingan kundan boshlab 30 kun ichida ko'rib chiqiladi.</p>

<h2>Qanday ma'lumotlar o'chiriladi</h2>
<ul>
  <li>Profil: ism, telefon raqami, elektron pochta manzili;</li>
  <li>saqlangan yetkazib berish manzillari;</li>
  <li>savat tarkibi va ko'rilgan mahsulotlar tarixi;</li>
  <li>akkauntning qurilmalar va push-bildirishnomalar bilan bog'lanishi.</li>
</ul>

<h2>Qanday ma'lumotlar saqlanadi va nima uchun</h2>
<p>
  Bajarilgan buyurtmalar to'g'risidagi ma'lumotlar (sana, tarkibi, summasi, to'lov usuli)
  O'zbekiston Respublikasining soliq va buxgalteriya qonunchiligida belgilangan muddat
  davomida saqlanadi. Bu qonun talabi bo'lib, akkauntni o'chirishdan qat'i nazar amal
  qiladi. Bunday yozuvlar profildan ajratiladi va siz bilan bog'lanish uchun ishlatilmaydi.
</p>

<h2>Muhim</h2>
<p>
  Akkauntni o'chirish qaytarib bo'lmaydigan amaldir. O'chirilgandan keyin buyurtmalar
  tarixini, saqlangan manzillarni va to'plangan bonuslarni tiklab bo'lmaydi.
</p>

<p>
  Qanday ma'lumotlarni to'plashimiz va ularni qanday qayta ishlashimiz haqida batafsil —
  <a href="/tashkent/privacy">Maxfiylik siyosatida</a>.
</p>
`

const EN = `
<h1>Delete your Chopar Pizza account</h1>

<p>
  This page explains how to delete your Chopar Pizza app account and its associated data.
  The data controller is Chopar delivery LLC.
</p>

<h2>Option 1. In the app</h2>
<ol>
  <li>Open the Chopar Pizza app and sign in to your account.</li>
  <li>Go to the Profile section.</li>
  <li>Tap "Delete account" and confirm.</li>
</ol>

<h2>Option 2. Request without the app</h2>
<p>
  If the app is not installed or you have lost access to your account, send a deletion
  request through any of the channels below. Include the phone number the account is
  registered to — it is needed to locate the account and confirm the request comes from
  its owner.
</p>
<ul>
  <li>Phone: <a href="tel:${SUPPORT_PHONE_TEL}">${SUPPORT_PHONE}</a></li>
  <li>Email: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></li>
  <li>Telegram: <a href="${SUPPORT_TELEGRAM}" rel="noopener noreferrer" target="_blank">@choparhelpbot</a></li>
</ul>
<p>Requests are processed within 30 days of receipt.</p>

<h2>What is deleted</h2>
<ul>
  <li>Profile: name, phone number, email address;</li>
  <li>saved delivery addresses;</li>
  <li>cart contents and browsing history;</li>
  <li>links between the account, devices and push notifications.</li>
</ul>

<h2>What is retained, and why</h2>
<p>
  Records of completed orders (date, contents, total, payment method) are kept for the
  period required by the tax and accounting legislation of the Republic of Uzbekistan.
  This is a legal obligation and applies regardless of account deletion. Such records are
  separated from your profile and are not used to contact you.
</p>

<h2>Important</h2>
<p>
  Account deletion is permanent. Order history, saved addresses and accumulated bonuses
  cannot be restored afterwards.
</p>

<p>
  For details on what we collect and how we process it, see our
  <a href="/tashkent/privacy">Privacy Policy</a>.
</p>
`

const BODIES: Record<StaticLocale, string> = { ru: RU, uz: UZ, en: EN }

export function getDeleteAccountBody(locale: StaticLocale): string {
  return BODIES[locale] ?? BODIES.ru
}
