module.exports = {
  locales: ['ru', 'uz'],
  defaultLocale: 'ru',
  pages: {
    '*': ['common'],
  },
  loadLocaleFrom: async (lang, ns) => {
    const res = await fetch(
      `https://api.hq.fungeek.net/api/langs/get_langs?lang=${lang}`
    )
    const { result } = await res.json()
    // console.log(result)
    return result
  },
  // You can use a dynamic import, fetch, whatever. You should
  // return a Promise with the JSON file.
  // import(`https://api.hq.fungeek.net/api/langs/get_langs?lang=${lang}`).then(
  //   (m) => m.result
  // ),
}
