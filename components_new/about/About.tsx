import useTranslation from 'next-translate/useTranslation'
import { FC, memo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

const About: FC = () => {
  const { locale } = useRouter()
  const { t: tr } = useTranslation('common')
  return (
    <>
      <div className="mx-5 md:mx-0">
        <div className="text-3xl mb-1">{tr('about')}</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
        <div className="md:grid gap-10 mb-8">
          {locale == 'ru' ? (
            <div>
              <p>
                Бренд <strong>Chopar</strong> («гонец» с узбекского) — это часть
                группы компаний <strong>“Havoqand people”</strong>, которая
                успешно работает на рынке Узбекистана и СНГ.
              </p>
              <p>
                История бренда начинается с 2015 года и в данный момент Chopar
                Pizza имеет 18 филиалов по всей стране и за ее пределами.
              </p>
              <p>В 2021 году мы вышли на рынок Казахстана.</p>
              <p>
                <strong>Chopar Pizza</strong> — это коллаборация восточных
                ценностей и современных традиций.
              </p>
              <p>
                Семейная пицца <strong>Chopar</strong> - отличный повод провести
                время в компании друзей или в семейном кругу. За 6 лет{' '}
                <strong>Chopar</strong> стал большой семьей, командой, где
                ценятся таланты и вырастают успешные кадры. Нас любят за
                качество и бережное отношение к традициям. Мы ценим каждого
                нашего клиента, сохраняем стандарты и стремимся быть лучше из
                года в год.
              </p>
            </div>
          ) : (
            <div>
              <p>
                <strong>Chopar</strong> brendi –{' '}
                <strong>“Havoqand people”</strong> kompaniyasining bir qismi
                bo’lib, O’zbekiston va MDH bozorida muvaffaqiyatli faoliyat
                ko’rsatib kelmoqda.
              </p>
              <p>
                Brend tarixi 2015 yildan boshlanadi &nbsp;va hozirda butun
                mamlakat bo’ylab hamda chet elda, umumiy 18 ta filialga ega.
              </p>
              <p>Biz 2021 yilda Qozog’iston bozoriga kirdik.</p>
              <p>
                <strong>Chopar</strong> – sharqona qadriyatlar va zamonaviy
                urf-odatlar uyg’unligidir!
              </p>
              <p>
                Oilaviy pizza <strong>Chopar</strong> – oila va do’stlar
                davrasida vaqt o’tkazish uchun ajoyib sabab. Olti yil ichida{' '}
                <strong>Chopar</strong> iqtidorlilar qadrlanadigan va
                muvaffaqiyatli insonlar yetishib chiqadigan katta oilaga, katta
                jamoaga aylandi. Bizni sifat va an`analarga nisbatan nozik
                yondoshuvimiz sabab yaxshi ko’rishadi. Biz har bir mijozni
                qadrlaymiz, standartlarni saqlagan holda yildan-yilga yanada
                yaxshi bo’lishga intilamiz.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default memo(About)
