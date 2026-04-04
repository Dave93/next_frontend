import axios from 'axios'

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

interface AnyObject {
  [key: string]: any
}

const defaultChannel = async (): Promise<AnyObject> => {
  let channelData: any
  if (typeof window !== 'undefined') {
    channelData = localStorage.getItem('channel')
    try {
      channelData = Buffer.from(channelData, 'base64')
      channelData = channelData.toString('ascii')
      channelData = JSON.parse(channelData)
    } catch (e) {}
  }
  if (!channelData) {
    const {
      data: { data },
    } = await axios.get(`${webAddress}/api/channels`)
    try {
      channelData = Buffer.from(data, 'base64')
      channelData = channelData.toString('ascii')
      channelData = JSON.parse(channelData)
    } catch (e) {}
    localStorage.setItem('channel', data)
  }

  return channelData
}

export default defaultChannel
