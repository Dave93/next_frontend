import { Fragment, FC, memo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Ru, Uz } from 'react-flags-select'
import { useRouter } from 'next/router'

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
  const { locale, pathname } = router
  const keyTyped = locale as keyof typeof locales
  const keyTypedLabel = locale as keyof typeof locales
  const localeComponent = locales[keyTyped]({})

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    return router.push(pathname, pathname, {
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
