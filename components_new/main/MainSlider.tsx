import { FC, memo, createRef, useState, useEffect, useRef } from 'react'
import Flicking, { ViewportSlot } from '@egjs/react-flicking'
import { Fade, AutoPlay, Pagination, Arrow } from '@egjs/flicking-plugins'
import axios from 'axios'
import { useRouter } from 'next/router'

const MainSlider: FC = () => {
  const router = useRouter()
  const { locale } = router

  const [sliders, setSliders] = useState([])
  const [defaultIndex, setDefaultIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)

  const [plugins, setPlugins] = useState(() => [
    new Fade('', 0.4),
    new AutoPlay({ duration: 3000, direction: 'NEXT', stopOnHover: false }),
    new Pagination({ type: 'bullet' }),
    new Arrow(),
  ])
  const sliderRef = createRef<Flicking>()

  const fetchSliders = async () => {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/public?locale=${locale}`
    )
    sliderRef.current?.destroy()
    setDefaultIndex(0)
    setMobileIndex(0)
    setSliders(data.data)
    // Recreate plugins so Pagination rebinds
    setPlugins([
      new Fade('', 0.4),
      new AutoPlay({ duration: 3000, direction: 'NEXT', stopOnHover: false }),
      new Pagination({ type: 'bullet' }),
      new Arrow(),
    ])
    setTimeout(() => {
      sliderRef.current?.init()
    }, 100)
  }

  useEffect(() => {
    fetchSliders()
  }, [locale])

  // Mobile auto-play (fade only, no scroll)
  useEffect(() => {
    if (sliders.length <= 1) return
    const id = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % sliders.length)
    }, 3000)
    autoPlayRef.current = id
    return () => clearInterval(id)
  }, [sliders.length])

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    if (sliders.length <= 1) return
    autoPlayRef.current = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % sliders.length)
    }, 3000)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setMobileIndex((prev) => (prev + 1) % sliders.length)
      } else {
        setMobileIndex((prev) => (prev - 1 + sliders.length) % sliders.length)
      }
      resetAutoPlay()
    }
  }

  const getImgSrc = (item: any, mobile: boolean) => {
    if (!item.asset) return ''
    if (mobile) {
      return item.asset[1] ? item.asset[1].link : item.asset[0].link
    }
    return item.asset[0].link
  }

  return (
    <div className="relative">
      {sliders && sliders.length > 0 && (
        <>
          {/* Mobile: fade slider */}
          <div className="md:hidden px-4">
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{ height: 170 }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {sliders.map((item: any, i: number) => (
                <div
                  key={item.id}
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{ opacity: i === mobileIndex ? 1 : 0 }}
                >
                  {item.link ? (
                    <a href={item.link} className="block h-full">
                      <img
                        src={getImgSrc(item, true)}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </a>
                  ) : (
                    <img
                      src={getImgSrc(item, true)}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Dots */}
            {sliders.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {sliders.map((_: any, i: number) => (
                  <button
                    key={i}
                    className="rounded-full transition-all"
                    style={{
                      width: i === mobileIndex ? 16 : 8,
                      height: 4,
                      backgroundColor: i === mobileIndex ? '#faaf04' : 'rgba(210,210,210,0.8)',
                    }}
                    onClick={() => setMobileIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop: Flicking slider */}
          <div className="hidden md:block">
            <Flicking
              align="center"
              circular={true}
              defaultIndex={defaultIndex}
              plugins={plugins}
              ref={sliderRef}
              renderOnlyVisible={true}
              autoResize={true}
              autoInit={true}
            >
              {sliders.map((item: any) => (
                <div className="panel max-w-full mr-6" key={item.id}>
                  <div className="rounded-[15px] overflow-hidden flex mb-[10px]">
                    {item.link ? (
                      <a href={item.link}>
                        {item.asset && (
                          <img
                            src={item.asset[0].link}
                            width={1600}
                            height={320}
                            data-href={item.link}
                          />
                        )}
                      </a>
                    ) : (
                      item.asset && (
                        <img
                          src={item.asset[0].link}
                          width={1600}
                          height={320}
                        />
                      )
                    )}
                  </div>
                </div>
              ))}
              <ViewportSlot>
                <div className="flicking-pagination justify-center flex"></div>
                <span className="flicking-arrow-prev is-circle"></span>
                <span className="flicking-arrow-next is-circle"></span>
              </ViewportSlot>
            </Flicking>
          </div>
        </>
      )}

      <style jsx global>{`
        .flicking-pagination-bullet {
          width: 15.18px;
          height: 4px;
          background: rgba(210, 210, 210, 0.8);
          border-radius: 10px;
          margin-right: 4px;
        }
        .flicking-pagination-bullet.flicking-pagination-bullet-active {
          background: #faaf04;
        }
      `}</style>
    </div>
  )
}

export default memo(MainSlider)
