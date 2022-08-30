import { Fragment, FC, memo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Ru, Uz } from 'react-flags-select'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'

const locales = {
  ru: Ru,
  uz: Uz,
}

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
}

const LanguageDropDown: FC = () => {
  const router = useRouter()
  const { locale, pathname, query } = router
  const keyTyped = locale as keyof typeof locales
  const keyTypedLabel = locale as keyof typeof locales
  const localeComponent = locales[keyTyped]({})
  const { activeCity } = useUI()

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    let link = pathname
    Object.keys(query).map((k: string) => {
      if (k == 'city') {
        link = link.replace('[city]', activeCity.slug)
      } else {
        link = link.replace(`[${k}]`, query[k]!.toString())
      }
    })
    return router.push(link, link, {
      locale: loc,
    })
  }
  return (
    <>
      <a
        className="bg-white focus:outline-none font-medium inline-flex justify-center outline-none px-4 py-2 text-secondary text-sm no-underline items-center"
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, locale == 'uz' ? 'ru' : 'uz')}
      >
        {locales[keyTyped]({})}{' '}
        <span className="ml-1.5">{localeLabel[keyTypedLabel]}</span>
      </a>
    </>
  )
}

export default memo(LanguageDropDown)
