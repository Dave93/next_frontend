import { FC, memo, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Link as ScrollLink } from 'react-scroll'
import NextLink from 'next/link'
import defaultChannel from '@lib/defaultChannel'
import { useUI } from '@components/ui/context'

const MobileCategoriesMenu: FC<{ categories: any[] }> = ({
  categories = [],
}) => {
  const { locale = 'ru', pathname } = useRouter()
  const { activeCity } = useUI()
  const [channelName, setChannelName] = useState('chopar')
  const isHome = pathname === '/[city]'

  useEffect(() => {
    defaultChannel().then((ch) => {
      if (ch?.name) setChannelName(ch.name)
    })
  }, [])

  if (!categories.length) return null

  return (
    <div
      className="md:hidden sticky z-20 mt-2"
      style={{ top: 'var(--header-h, 0px)' }}
    >
      <div
        id="mobileCatScroller"
        className="bg-secondary overflow-x-auto rounded-xl mx-3"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex h-11 items-center px-3 min-w-max">
          {categories.map((item: any) => {
            const name =
              item?.attribute_data?.name?.[channelName]?.[locale || 'ru'] || ''

            return (
              <div
                className="text-white font-serif text-sm text-center cursor-pointer uppercase px-3 whitespace-nowrap"
                key={item.id}
                id={`mobileCat_${item.id}`}
              >
                {isHome ? (
                  <ScrollLink
                    to={`productSection_${item.id}`}
                    spy={true}
                    smooth={true}
                    activeClass="text-yellow"
                    offset={-200}
                    onSetActive={() => {
                      const el = document.getElementById(
                        `mobileCat_${item.id}`
                      )
                      const scroller =
                        document.getElementById('mobileCatScroller')
                      if (el && scroller) {
                        const left =
                          el.offsetLeft -
                          scroller.offsetWidth / 2 +
                          el.offsetWidth / 2
                        scroller.scrollTo({ left, behavior: 'smooth' })
                      }
                    }}
                  >
                    {name}
                  </ScrollLink>
                ) : (
                  <NextLink
                    href={`/${activeCity?.slug || ''}#productSection_${item.id}`}
                    prefetch={false}
                    className="text-white"
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
