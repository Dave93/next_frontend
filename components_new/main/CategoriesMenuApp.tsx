'use client'
import { FC, memo, useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const headerH =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0
  const navH =
    document.getElementById('categoriesMenuSticky')?.offsetHeight || 56
  const top = el.getBoundingClientRect().top + window.scrollY - headerH - navH - 8
  window.scrollTo({ top, behavior: 'smooth' })
}

const CategoriesMenu: FC<{ categories: any[]; channelName: string }> = ({
  categories = [],
  channelName = '',
}) => {
  const locale = useLocale()
  const [activeId, setActiveId] = useState<number | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // Publish own height into a CSS var so the right-rail sticky sidebar in
  // CityMainApp can offset itself past this nav (otherwise it slides under).
  useEffect(() => {
    const el = document.getElementById('categoriesMenuSticky')
    if (!el) return
    const apply = () => {
      document.documentElement.style.setProperty(
        '--cats-h',
        `${el.offsetHeight}px`
      )
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    window.addEventListener('resize', apply)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
    }
  }, [categories.length])

  useEffect(() => {
    if (!categories.length) return
    const headerH =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--header-h'
        )
      ) || 0
    const navH =
      document.getElementById('categoriesMenuSticky')?.offsetHeight || 56
    const topOffset = headerH + navH + 8

    const sections: { id: number; el: HTMLElement }[] = categories
      .map((c) => ({ id: c.id, el: document.getElementById(`productSection_${c.id}`) }))
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
  }, [categories])

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
      className="hidden md:block sticky z-20 bg-secondary shadow-lg"
      style={{ top: 'var(--header-h, 0px)' }}
      id="categoriesMenuSticky"
    >
      <div
        ref={scrollerRef}
        className="container flex items-center m-auto overflow-x-auto md:overflow-x-visible"
      >
        <div className="flex h-14 items-center justify-evenly w-full">
          {categories.map((item: any) => {
            const isActive = activeId === item.id
            return (
              <div
                ref={(el) => {
                  itemRefs.current[item.id] = el
                }}
                onClick={() => scrollToSection(`productSection_${item.id}`)}
                className={`${
                  isActive ? 'text-yellow' : 'text-white'
                } font-serif text-base text-center cursor-pointer uppercase min-w-max px-4`}
                key={item.id}
              >
                {item?.attribute_data?.name[channelName][locale || 'ru']}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(CategoriesMenu)
