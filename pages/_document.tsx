import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Restaurant',
                name: 'Chopar Pizza',
                description: 'Доставка пиццы с тандырным тестом в Ташкенте. Халяль. Бесплатная доставка.',
                url: 'https://choparpizza.uz',
                telephone: '+998712051111',
                servesCuisine: ['Pizza', 'Italian', 'Uzbek'],
                priceRange: '$$',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Ташкент',
                  addressCountry: 'UZ',
                },
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: 41.2995,
                  longitude: 69.2401,
                },
                openingHoursSpecification: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                  opens: '10:00',
                  closes: '03:00',
                },
                sameAs: [
                  'https://www.instagram.com/choparpizza/',
                  'https://www.facebook.com/choparpizza',
                  'https://t.me/Chopar_bot',
                ],
                image: 'https://choparpizza.uz/icon512x.png',
                hasMenu: {
                  '@type': 'Menu',
                  url: 'https://choparpizza.uz/tashkent',
                },
              }),
            }}
          />
        </Head>
        <body className="loading">
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TSJ79WZ"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          ></noscript>
          <Main />
          <NextScript />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('load', function(){
                  setTimeout(function(){
                    var s=document.createElement('script');s.async=true;
                    s.src='/crm-scripts/ct.min.js?'+(Date.now()/60000|0);
                    document.body.appendChild(s);
                  }, 3000);
                });
              `,
            }}
          ></script>
        </body>
      </Html>
    )
  }
}

export default MyDocument
