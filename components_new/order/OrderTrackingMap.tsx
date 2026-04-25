'use client'

import { FC, useRef, useMemo } from 'react'
import { YMaps, Map, Placemark } from 'react-yandex-maps'
import type { MapState, MapStateBase, MapStateCenter } from 'react-yandex-maps'

interface OrderTrackingMapProps {
  mapCenter: number[]
  placeMarks: any[]
  coords: any[]
  points: any
  courier: any
}

const OrderTrackingMap: FC<OrderTrackingMapProps> = ({
  mapCenter,
  placeMarks,
  coords,
  points,
  courier,
}) => {
  const map = useRef<any>(null)

  const mapState = useMemo<MapState>(() => {
    const baseState: MapStateBase = {
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
    }
    const mapStateCenter: MapStateCenter = {
      center: mapCenter || [],
      zoom: 17,
    }
    return Object.assign({}, baseState, mapStateCenter)
  }, [mapCenter])

  const width =
    typeof window !== 'undefined' && window.innerWidth < 768
      ? '400px'
      : '1152px'
  const height =
    typeof window !== 'undefined' && window.innerWidth < 768
      ? '200px'
      : '530px'

  return (
    <div className="relative">
      <YMaps
        query={{
          lang: 'ru_RU',
          load: 'package.full',
          coordorder: 'latlong',
        }}
      >
        <div className="relative">
          <Map
            state={mapState}
            width={width}
            height={height}
            modules={[
              'control.ZoomControl',
              'control.FullscreenControl',
              'control.GeolocationControl',
              'geoQuery',
            ]}
            instanceRef={(ref) => (map.current = ref)}
            onLoad={(ymaps) => {
              setTimeout(() => {
                if (coords?.length > 0) {
                  var mapPoints: any[] = coords.map((point) => [
                    point.latitude,
                    point.longitude,
                  ])
                  var polyline = new ymaps.Polyline(
                    mapPoints,
                    {},
                    {
                      strokeColor: '#5b6ffa',
                      strokeWidth: 5,
                    }
                  )
                  map.current.geoObjects.add(polyline)
                }
              }, 300)
              var placemark = new ymaps.Placemark(
                [points?.from_location.lat, points?.from_location.lon],
                {
                  hintContent: 'Адрес отправления',
                  iconContent: 'A',
                },
                {
                  preset: 'islands#blueCircleIcon',
                }
              )
              map.current.geoObjects.add(placemark)

              placemark = new ymaps.Placemark(
                [points?.to_location.lat, points?.to_location.lon],
                {
                  hintContent: 'Адрес клиента',
                  iconContent: 'B',
                },
                {
                  preset: 'islands#darkGreenCircleIcon',
                }
              )
              map.current.geoObjects.add(placemark)
              let bounds = map.current.geoObjects.getBounds()
              map.current.setBounds(bounds)
            }}
          >
            {placeMarks.map((i) => (
              <Placemark
                modules={['geoObject.addon.balloon']}
                defaultGeometry={i.location}
                geomerty={i.location}
                key={`placemark-${i.key}`}
                defaultOptions={{
                  iconLayout: 'default#image',
                  iconImageHref: '/map_placemark-courier.png',
                  iconImageSize: [35, 35],
                  iconImageOffset: [-25, -45],
                }}
              />
            ))}
          </Map>
        </div>
      </YMaps>
      {courier && (
        <div className="bg-white border-2 border-yellow text-gray-700 px-4 py-3 shadow-lg rounded-md absolute bottom-4 right-4">
          <h3 className="text-xl font-medium mb-2 text-center uppercase">
            Курьер
          </h3>
          <div className="flex items-center">
            <p className="text-md">
              {courier.last_name} {courier.first_name}
            </p>
          </div>
          <div className="flex items-center mt-2 justify-around">
            <p className="text-md">
              <a href={`tel:${courier.phone}`}>{courier.phone}</a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderTrackingMap
