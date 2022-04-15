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
                (function(w,d,u){
                  var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/60000|0);
                  var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);
                })(window,document,'https://crm.choparpizza.uz/upload/crm/tag/call.tracker.js');
              `,
            }}
          ></script>
        </body>
      </Html>
    )
  }
}

export default MyDocument
