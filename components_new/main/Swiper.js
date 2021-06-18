import React from 'react'
import Slider from 'react-slick'
import Image from 'next/image'

function SampleNextArrow(props) {
  const { className, style, onClick } = props
  return <div className={className} style={{ ...style }} onClick={onClick} />
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props
  return <div className={className} style={{ ...style }} onClick={onClick} />
}

export default function Swiper() {
  var settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '100px',
    slidesToShow: 1,
    speed: 500,
    variableWidth: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  }
  return (
    <>
      <Slider {...settings}>
        <div style={{ width: 1160, marginLeft: '25px', marginRight: '25px' }}>
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div style={{ width: 1160, marginLeft: '25px', marginRight: '25px' }}>
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div style={{ width: 1160, marginLeft: '25px', marginRight: '25px' }}>
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div style={{ width: 1160, marginLeft: '25px', marginRight: '25px' }}>
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div style={{ width: 1160, marginLeft: '25px', marginRight: '25px' }}>
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
        <div style={{ width: 1160, marginLeft: '25px', marginRight: '25px' }}>
          <div className="rounded-[15px] overflow-hidden">
            <Image src="/banner/banner.png" width={1160} height={320} />
          </div>
        </div>
      </Slider>
      <style global jsx>{`
        .slick-slide {
          margin: 0 12px;
          opacity: 0.4;
        }
        .slick-active {
          opacity: 1;
        }
        /* the parent */
        .slick-list {
          margin: 0 -12px;
        }
        .slick-prev {
          left: 23%;
          z-index: 2;
        }
        .slick-next {
          right: 7%;
        }
        .slick-prev:before,
        .slick-next:before {
          font-size: 40px;
          opacity: 1;
        }
      `}</style>
    </>
  )
}
