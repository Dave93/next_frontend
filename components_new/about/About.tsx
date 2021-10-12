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
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}>Бренд <strong>Chopar</strong> («гонец» с узбекского) — это часть группы компаний <strong>“Havoqand people”</strong>, которая успешно работает на рынке Узбекистана и СНГ.</p>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}>История бренда начинается с 2015 года и в данный момент Chopar Pizza имеет 18 филиалов по всей стране и за ее пределами.</p>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}>В 2021 году мы вышли на рынок Казахстана.</p>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}><strong>Chopar Pizza</strong> — это коллаборация восточных ценностей и современных традиций.</p>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}>Семейная пицца <strong>Chopar</strong> - отличный повод провести время в компании друзей или в семейном кругу. За 6 лет <strong>Chopar</strong> стал большой семьей, командой, где ценятся таланты и вырастают успешные кадры. Нас любят за качество и бережное отношение к традициям. Мы ценим каждого нашего клиента, сохраняем стандарты и стремимся быть лучше из года в год.</p>
        </div>
      ) : (
        <div>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}><strong>Chopar</strong> brendi – <strong>“Havoqand people”</strong> kompaniyasining bir qismi bo’lib, O’zbekiston va MDH bozorida muvaffaqiyatli faoliyat ko’rsatib kelmoqda.</p>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}>Brend tarixi 2015 yildan boshlanadi &nbsp;va hozirda butun mamlakat bo’ylab hamda chet elda, umumiy 18 ta filialga ega.</p>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}>Biz 2021 yilda Qozog’iston bozoriga kirdik.</p>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}><strong>Chopar</strong> – sharqona qadriyatlar va zamonaviy urf-odatlar uyg’unligidir!</p>
          <p style={{marginTop: '0cm', marginRight: '0cm', marginBottom: '8.0pt', marginLeft: '0cm', lineHeight: '107%', fontSize: '15px', fontFamily: '"Calibri",sans-serif'}}>Oilaviy pizza <strong>Chopar</strong> – oila va do’stlar davrasida vaqt o’tkazish uchun ajoyib sabab. Olti yil ichida <strong>Chopar</strong> iqtidorlilar qadrlanadigan va muvaffaqiyatli insonlar yetishib chiqadigan katta oilaga, katta jamoaga aylandi. Bizni sifat va an`analarga nisbatan nozik yondoshuvimiz sabab yaxshi ko’rishadi. Biz har bir mijozni qadrlaymiz, standartlarni saqlagan holda yildan-yilga yanada yaxshi bo’lishga intilamiz.</p>
        </div>
      )}
    </>
  )
}

export default memo(About)
