'use client'
import { FC, memo, useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, Link as NextLink } from '../../i18n/navigation'
import defaultChannel from '@lib/defaultChannel'
import { useUI } from '@components/ui/context'

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const headerH =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0
  const navH =
    document.getElementById('mobileCatScroller')?.offsetHeight || 44
  const top = el.getBoundingClientRect().top + window.scrollY - headerH - navH - 8
  window.scrollTo({ top, behavior: 'smooth' })
}

const MobileCategoriesMenu: FC<{ categories: any[] }> = ({
  categories = [],
}) => {
  const locale = useLocale()
  const pathname = usePathname()
  const { activeCity } = useUI()
  const [channelName, setChannelName] = useState('chopar')
  const isHome = pathname === '/[city]'
  const [activeId, setActiveId] = useState<number | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    defaultChannel().then((ch) => {
      if (ch?.name) setChannelName(ch.name)
    })
  }, [])

  useEffect(() => {
    if (!categories.length || !isHome) return
    const headerH =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--header-h'
        )
      ) || 0
    const navH =
      document.getElementById('mobileCatScroller')?.offsetHeight || 44
    const topOffset = headerH + navH + 8

    const sections: { id: number; el: HTMLElement }[] = categories
      .map((c) => ({
        id: c.id,
        el: document.getElementById(`productSection_${c.id}`),
      }))
      .filter((s): s is { id: number; el: HTMLElement } => !!s.el)
    if (!sections.length) return

    const update = () => {
      const probe = topOffset + 1
      let current = sections[0].id
      for (const s of sections) {
        const top = s.el.getBoundingClientRect().top
        if (top - probe <= 0) current = s.id
      }
      setActiveId((prev) => (prev === current ? prev : current))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [categories, isHome])

  useEffect(() => {
    if (activeId == null) return
    const item = itemRefs.current[activeId]
    const scroller = scrollerRef.current
    if (!item || !scroller) return
    const left =
      item.offsetLeft - scroller.offsetWidth / 2 + item.offsetWidth / 2
    scroller.scrollTo({ left, behavior: 'smooth' })
  }, [activeId])

  if (!categories.length) return null

  return (
    <div
      className="md:hidden sticky z-20 mt-2"
      style={{ top: 'var(--header-h, 0px)' }}
    >
      <div
        ref={scrollerRef}
        id="mobileCatScroller"
        className="bg-secondary overflow-x-auto rounded-xl mx-3"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex h-11 items-center px-3 min-w-max">
          {categories.map((item: any) => {
            const name =
              item?.attribute_data?.name?.[channelName]?.[locale || 'ru'] || ''
            const isActive = activeId === item.id

            return (
              <div
                ref={(el) => {
                  itemRefs.current[item.id] = el
                }}
                className={`${
                  isActive ? 'text-yellow' : 'text-white'
                } font-serif text-sm text-center cursor-pointer uppercase px-3 whitespace-nowrap`}
                key={item.id}
                onClick={
                  isHome
                    ? () => scrollToSection(`productSection_${item.id}`)
                    : undefined
                }
              >
                {isHome ? (
                  <span>{name}</span>
                ) : (
                  <NextLink
                    href={`/${activeCity?.slug || ''}#productSection_${item.id}`}
                    prefetch={false}
                    className={isActive ? 'text-yellow' : 'text-white'}
                  >
                    {name}
                  </NextLink>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(MobileCategoriesMenu)
