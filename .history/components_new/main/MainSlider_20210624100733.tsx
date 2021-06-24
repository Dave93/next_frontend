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
    <div className="relative">
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
      <div className="absolute top-36 z-10">
      <div
        className="cursor-pointer left-72"
        onClick={() => slidePrev()}
      >
        <Image src="/assets/slider_arrow_left.png" width={46} height={46} />
      </div>
      <div
        className="cursor-pointer right-72"
        onClick={() => slideNext()}
      >
        <Image src="/assets/slider_arrow_right.png" width={46} height={46} />
      </div>
      </div>
    </div>
  )
}

export default memo(MainSlider)
