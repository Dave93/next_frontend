'use client'

import { FC, memo, useState, useEffect, useCallback, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import axios from 'axios'
import { useLocale } from 'next-intl'

interface MainSliderProps {
  initialSliders?: any[]
}

type CarouselProps = {
  sliders: any[]
}

const SliderCarousel: FC<CarouselProps> = ({ sliders }) => {
  const autoplayRef = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [autoplayRef.current]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [snapPoints, setSnapPoints] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setSnapPoints(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  )

  return (
    <div className="relative rounded-2xl mx-3 md:mx-auto mt-2 md:mt-0 overflow-hidden md:container">
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex w-full touch-pan-y">
          {sliders.map((item: any, index: number) => (
            <div
              className="relative rounded-[15px] overflow-hidden"
              style={{ flex: '0 0 100%', minWidth: 0 }}
              key={item.id}
            >
              {item.link ? (
                <a href={item.link} className="block w-full">
                  {item.asset && (
                    <>
                      <img
                        src={item.asset[0].link}
                        className="hidden md:block w-full max-h-[400px] object-cover"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        width={1200}
                        height={400}
                        alt=""
                      />
                      <img
                        src={
                          item.asset[1]
                            ? item.asset[1].link
                            : item.asset[0].link
                        }
                        className="md:hidden w-full h-[44vw] object-cover"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        width={600}
                        height={264}
                        alt=""
                      />
                    </>
                  )}
                </a>
              ) : (
                item.asset && (
                  <>
                    <img
                      src={item.asset[0].link}
                      className="hidden md:block w-full max-h-[400px] object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      width={1200}
                      height={400}
                      alt=""
                    />
                    <img
                      src={
                        item.asset[1]
                          ? item.asset[1].link
                          : item.asset[0].link
                      }
                      className="md:hidden w-full h-[44vw] object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      width={600}
                      height={264}
                      alt=""
                    />
                  </>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {snapPoints.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="prev"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white items-center justify-center shadow z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="#F9B004"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="next"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white items-center justify-center shadow z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="#F9B004"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {snapPoints.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`slide ${i + 1}`}
                className="h-1 rounded-full transition-all"
                style={{
                  width: selectedIndex === i ? 24 : 15,
                  background:
                    selectedIndex === i
                      ? '#F9B004'
                      : 'rgba(210, 210, 210, 0.85)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const MainSlider: FC<MainSliderProps> = ({ initialSliders }) => {
  const locale = useLocale()
  const [sliders, setSliders] = useState(initialSliders || [])
  const prevLocale = useRef(locale)

  const fetchSliders = async (forLocale: string) => {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/public?locale=${forLocale}`
    )
    setSliders(data.data || [])
  }

  useEffect(() => {
    if (!initialSliders?.length) {
      fetchSliders(locale)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (prevLocale.current !== locale) {
      prevLocale.current = locale
      fetchSliders(locale)
    }
  }, [locale])

  if (!sliders || sliders.length === 0) return null

  // Keying on locale forces a fresh embla instance when language changes —
  // avoids stale snap-points and dead pagination after a full re-fetch.
  return <SliderCarousel key={locale} sliders={sliders} />
}

export default memo(MainSlider)
