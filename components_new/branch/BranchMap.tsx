'use client'

import { YMaps, Map, Placemark } from 'react-yandex-maps'

type Branch = {
  id: number | string
  location?: { lat: number; lon: number } | null
  [key: string]: unknown
}

type Props = {
  branches: Branch[]
  mapState: {
    center: [number, number]
    zoom: number
  }
}

export default function BranchMap({ branches, mapState }: Props) {
  return (
    <YMaps>
      <Map state={mapState} width="100%" height={500}>
        {branches.map((branch) =>
          branch.location ? (
            <Placemark
              key={branch.id}
              geometry={[branch.location.lat, branch.location.lon]}
              options={{
                iconLayout: 'default#image',
                iconImageHref: '/map_placemark.png',
                iconImageSize: [50, 55],
              }}
            />
          ) : null
        )}
      </Map>
    </YMaps>
  )
}
