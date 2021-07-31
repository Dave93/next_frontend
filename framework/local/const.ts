import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
export const STORE_DOMAIN = process.env.STORE_DOMAIN
const apiUrl = process.env.API_URL
export const API_URL = `${publicRuntimeConfig.apiUrl}/api/`
