import useTranslation from 'next-translate/useTranslation'
import { FC, memo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

const About: FC = () => {
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
              Бренд <strong>Chopar</strong> («гонец» с узбекского) - это часть
              группы компаний{' '}
              <strong>
                <em>«</em>
              </strong>
              <strong>
                Havoqand people<em>»</em>
              </strong>
              , успешно работает на рынке Узбекистана и СНГ.
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
              С 2015 года бренд борется за звание лучшей сети пиццерий в
              Республике и в данный момент оперирует более 19 филиалами по всей
              стране и за ее пределами.&nbsp;
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
              В 2021 году мы вышли на рынок Казахстана.&nbsp;
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
            <strong>
              <span style={{ fontFamily: '"Times",serif' }}>Chopar</span>
            </strong>
            <span style={{ fontFamily: '"Times",serif' }}>
              &nbsp;- это коллаборация восточных ценностей и современных
              традиций.&nbsp;
            </span>
          </p>
          <p>
            <span style={{ fontSize: '16px', fontFamily: '"Times",serif' }}>
              Семейная пицца Chopar - отличный повод провести время в компании
              друзей или в семейном кругу. За 6 лет Chopar стал большой семьей,
              командой, где ценятся таланты и вырастают успешные кадры. Нас
              любят за качество и бережное отношение к традициям. Мы ценим
              каждого нашего клиента, сохраняем стандарты и стремимся быть лучше
              из года в год.
            </span>
          </p>
        </div>
      ) : (
        <div>
          <p
            style={{
              margin: '0cm',
              marginBottom: '.0001pt',
              fontSize: '16px',
              fontFamily: '"Calibri",sans-serif',
            }}
          >
            <strong>
              <span style={{ fontFamily: '"Times",serif' }}>Chopar</span>
            </strong>
            <span style={{ fontFamily: '"Times",serif' }}>
              &nbsp;brendi -{' '}
              <strong>
                <em>«</em>
              </strong>
              <strong>
                Havoqand people<em>»</em>
              </strong>{' '}
              kompaniyalar guruhining bir qismi bo'lib, O'zbekiston va MDH
              bozorida faoliyat yuritib kelmoqda.&nbsp;
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
              2015-yildan buyon brendimiz O'zbekistondagi eng yaxshi
              pitseriyalar tarmog'i maqomi uchun kurashmoqda va hozirgi paytda
              mamlakatimizda va undan tashqarida __ dan ortiq filiallariga ega.
              2021-yilda biz Qozog'iston bozoriga kirdik.&nbsp;
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
            <strong>
              <span style={{ fontFamily: '"Times",serif' }}>Chopar</span>
            </strong>
            <span style={{ fontFamily: '"Times",serif' }}>
              &nbsp;- sharqona qadriyatlar va zamonaviy an'analar
              uyg'unligidir.&nbsp;
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
              Choparning oilaviy pitsasi - oila va do'stlar davrasida vaqt
              o'tkazish uchun yaxshigina sabab.&nbsp;
            </span>
            <span style={{ fontFamily: '"Times",serif' }}>
              6 yil ichida Chopar iqtidorlilar qadrlanadigan va muvaffaqiyatli
              insonlar yetishib chiqadigan katta oilaga aylandi. Bizni sifat va
              an'analarga bo'lgan nozik yondashuv uchun yaxshi ko'rishadi. Biz
              har bir mijozimizni qadrlaymiz, standartlarni saqlagan holda
              yildan-yilga yanada mukammal bo'lishga intilamiz
            </span>
          </p>
        </div>
      )}
    </>
  )
}

export default memo(About)
