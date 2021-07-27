import axios from 'axios'

export default async function handler(req: any, res: any) {
  const {
    query: { text },
  } = req

  console.log(text)

  let { data: configData } = await axios.get(
    `${process.env.API_URL}/api/configs/public`
  )

  console.log(configData)

  try {
    configData = Buffer.from(configData.data, 'base64')
    configData = configData.toString('ascii')
    configData = JSON.parse(configData)
  } catch (e) {}

  const { data: getCodeData } = await axios.get(
    `https://geocode-maps.yandex.ru/1.x/?apikey=${
      configData.yandexGeoKey
    }&geocode=${encodeURI(text)}`
  )

  res.status(200).json([])
}
