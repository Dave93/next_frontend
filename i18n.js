import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
module.exports = {
  locales: ['ru', 'uz'],
  defaultLocale: 'ru',
  pages: {
    '*': ['common'],
  },
  loadLocaleFrom: async (lang, ns) => {
    const res = await fetch(
      `${publicRuntimeConfig.apiUrl}/api/get_langs?lang=${lang}`
    )
    const { result } = await res.json()
    // console.log(result)
    return result
  },
}
