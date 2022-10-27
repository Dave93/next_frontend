import { FC, memo } from 'react'
import { Ru, Uz } from 'react-flags-select'
import { useRouter } from 'next/router'

const LanguageDropDown: FC = () => {
  const router = useRouter()
  const { locale, pathname } = router

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    return router.push(pathname, pathname, {
      locale: loc,
    })
  }
  return (
    <>
      <a
        className="bg-white rounded-2xl focus:outline-none font-medium inline-flex justify-center outline-none items-center text-secondary text-sm no-underline w-16 h-7 mr-3"
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'ru')}
      >
        <Ru className="w-5"/>
        <span className="ml-1.5">Ru</span>
      </a>
      <a
        className="bg-white rounded-2xl focus:outline-none font-medium inline-flex justify-center outline-none items-center text-secondary text-sm no-underline w-16 h-7"
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'uz')}
      >
        <Uz />
        <span className="ml-1.5">Uz</span>
      </a>
    </>
  )
}

export default memo(LanguageDropDown)
