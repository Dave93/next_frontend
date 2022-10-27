import { FC, memo, createRef, useState, useEffect } from 'react'
import Flicking, { ViewportSlot } from '@egjs/react-flicking'
import { Fade, AutoPlay, Pagination } from '@egjs/flicking-plugins'
import Image from 'next/image'
import {
  useWindowSize,
  useWindowWidth,
  useWindowHeight,
} from '@react-hook/window-size'
import { useUI } from '@components/ui'
import getConfig from 'next/config'
import axios from 'axios'
import Link from 'next/link'

const { publicRuntimeConfig } = getConfig()

const MainSlider: FC = () => {
  const { activeCity } = useUI()

  const [sliders, setSliders] = useState([])

  const plugins = [
    new Fade('', 0.4),
    // new AutoPlay({ duration: 2000, direction: 'NEXT', stopOnHover: false }),
    new Pagination({ type: 'bullet' }),
  ]
  const sliderRef = createRef<Flicking>()

  const slideNext = () => {
    sliderRef.current?.next()
  }

  const slidePrev = () => {
    sliderRef.current?.prev()
  }
  const onlyWidth = useWindowWidth({
    initialWidth: 1920,
    wait: 400,
  })

  const fetchSliders = async () => {
    if (activeCity) {
      const { data } = await axios.get(
        `${publicRuntimeConfig.apiUrl}/api/sliders?city_id=${activeCity.id}`
      )
      setSliders(data.data)
    }
  }

  useEffect(() => {
    fetchSliders()
    return
  }, [activeCity])

  return (
    <div className="relative px-4 rounded-2xl">
      {sliders.length && (
        <>
          <Flicking
            align="center"
            circular={true}
            defaultIndex={1}
            plugins={plugins}
            ref={sliderRef}
          >
            {sliders.map((item: any) => (
              <div className="panel max-w-full mr-6" key={item.id}>
                <div className="rounded-[15px] overflow-hidden flex mb-[10px]">
                  {item.link ? (
                    <Link href={item.link} prefetch={false}>
                      {item.asset && (
                        <>
                          <div className="hidden md:block">
                            <Image
                              src={item.asset[0].link}
                              width={1160}
                              height={320}
                              layout="intrinsic"
                            />
                          </div>
                          <div className="md:hidden">
                            <Image
                              src={
                                item.asset[1]
                                  ? item.asset[1].link
                                  : item.asset[0].link
                              }
                              width={800}
                              height={300}
                            />
                          </div>
                        </>
                      )}
                    </Link>
                  ) : (
                    item.asset && (
                      <>
                        <div className="hidden md:block">
                          <Image
                            src={item.asset[0].link}
                            width={1160}
                            height={320}
                            layout="intrinsic"
                          />
                        </div>
                        <div className="md:hidden">
                          <Image
                            src={
                              item.asset[1]
                                ? item.asset[1].link
                                : item.asset[0].link
                            }
                            width={800}
                            height={300}
                          />
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>
            ))}
            <ViewportSlot>
              <div className="md:hidden flicking-pagination justify-center flex"></div>
            </ViewportSlot>
          </Flicking>
          <div
            className="hidden md:block md:absolute cursor-pointer left-72 lg:left-28 top-36 z-10"
            onClick={() => slidePrev()}
          >
            <Image src="/assets/slider_arrow_left.png" width={46} height={46} />
          </div>
          <div
            className="hidden md:block md:absolute cursor-pointer right-72 lg:right-28 top-36 z-10"
            onClick={() => slideNext()}
          >
            <Image
              src="/assets/slider_arrow_right.png"
              width={46}
              height={46}
            />
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
