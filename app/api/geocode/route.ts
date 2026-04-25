import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get('text')
  const bounds = searchParams.get('bounds')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!text && !(lat && lon)) {
    return NextResponse.json([])
  }

  let { data: configData } = await axios.get(
    `${process.env.API_URL}/api/configs/public`
  )

  try {
    configData = Buffer.from(configData.data, 'base64')
    configData = configData.toString('ascii')
    configData = JSON.parse(configData)
  } catch {}

  let yandexKey = configData.yandexGeoKey
  yandexKey = yandexKey.split(',')
  yandexKey = yandexKey[Math.floor(Math.random() * yandexKey.length)]

  let yandexUrl: string
  if (lat && lon) {
    // reverse geocode: Yandex expects "lon,lat"
    yandexUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexKey}&geocode=${lon},${lat}&kind=house&format=json&results=1`
  } else {
    const boundsArray = (bounds || '').split(',')
    yandexUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexKey}&geocode=${encodeURI(
      text!
    )}&bbox=${boundsArray[0]},${boundsArray[1]}~${boundsArray[2]},${boundsArray[3]}&format=json`
  }

  const { data: getCodeData } = await axios.get(yandexUrl)

  const result: any[] = []

  getCodeData.response.GeoObjectCollection.featureMember.map((item: any) => {
    const formattedArray: any[] = []
    item.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components.map(
      (comp: any) => {
        if (
          ['country', 'province', 'district', 'street', 'house'].includes(
            comp.kind
          )
        ) {
          formattedArray.push(comp.name)
        }
      }
    )
    result.push({
      title: item.GeoObject.name,
      description: item.GeoObject.description,
      addressItems:
        item.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components,
      formatted: formattedArray.join(', '),
      coordinates: {
        long: item.GeoObject.Point.pos.split(' ')[0],
        lat: item.GeoObject.Point.pos.split(' ')[1],
      },
    })
  })

  return NextResponse.json(result)
}
