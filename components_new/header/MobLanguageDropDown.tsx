import { FC, memo } from 'react'
import { Ru, Uz, Us } from 'react-flags-select'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'

const LanguageDropDown: FC = () => {
  const router = useRouter()
  const { activeCity } = useUI()
  const { locale, pathname } = router

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    let path = pathname.replace('[city]', activeCity.slug)
    return router.push(path, path, {
      locale: loc,
    })
  }
  return (
    <div className="flex gap-2">
      <a
        className="bg-white rounded-2xl focus:outline-none font-medium inline-flex justify-center outline-none items-center text-secondary text-sm no-underline w-16 h-7"
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'ru')}
      >
        <Ru className="w-5" />
        <span className="ml-1.5">Ru</span>
      </a>
      <a
        className="bg-white rounded-2xl focus:outline-none font-medium inline-flex justify-center outline-none items-center text-secondary text-sm no-underline w-16 h-7"
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'uz')}
      >
        <Uz className="w-5" />
        <span className="ml-1.5">Uz</span>
      </a>
      <a
        className="bg-white rounded-2xl focus:outline-none font-medium inline-flex justify-center outline-none items-center text-secondary text-sm no-underline w-16 h-7"
        href={`/${locale}${pathname}`}
        onClick={(e) => changeLang(e, 'en')}
      >
        <Us className="w-5" />
        <span className="ml-1.5">En</span>
      </a>
    </div>
  )
}

export default memo(LanguageDropDown)
