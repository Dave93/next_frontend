import { FC, memo, createRef } from 'react'
import Flicking from '@egjs/react-flicking'
import { Fade, AutoPlay } from '@egjs/flicking-plugins'
import Image from 'next/image'

const MainSlider: FC = () => {
  const plugins = [
    new Fade('', 0.4),
    new AutoPlay({ duration: 2000, direction: 'NEXT', stopOnHover: false }),
  ]
  const sliderRef = createRef<Flicking>()

  const slideNext = () => {
    sliderRef.current?.next()
  }

  const slidePrev = () => {
    sliderRef.current?.prev()
  }
  return (
    <div className="relative px-4 rounded-2xl">
      <Flicking
        align="center"
        circular={true}
        defaultIndex={1}
        plugins={plugins}
        ref={sliderRef}
      >
        <div className="panel mr-6">
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div className="panel mr-6">
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div className="panel mr-6">
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div className="panel mr-6">
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div className="panel mr-6">
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div className="panel mr-6">
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
      </Flicking>
      <div className="pagination pagination2"></div>
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
        <Image src="/assets/slider_arrow_right.png" width={46} height={46} />
      </div>
    </div>
  )
}

export default memo(MainSlider)
