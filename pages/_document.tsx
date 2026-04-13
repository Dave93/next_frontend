import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
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
                    s.src='https://crm.choparpizza.uz/upload/crm/tag/call.tracker.js?'+(Date.now()/60000|0);
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
