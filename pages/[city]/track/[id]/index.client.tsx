import React, { useState, useEffect, useMemo } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useQuery } from 'react-query'
import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import {
  TruckIcon,
  PhoneIcon,
  UserIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/solid'
import { renderToStaticMarkup } from 'react-dom/server'
import { Bike, Car, Truck, Footprints, User as LucideUser } from 'lucide-react'
import { FaPersonWalking } from 'react-icons/fa6'
import styles from './Track.module.css'
import { useUI } from '@components/ui'

// Conditionally import Leaflet only on client side
let L: any
if (typeof window !== 'undefined') {
  L = require('leaflet')
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  })
}

// Create typed wrapper components for react-leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer as any),
  { ssr: false }
) as any

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer as any),
  { ssr: false }
) as any

const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker as any),
  { ssr: false }
) as any

const { publicRuntimeConfig } = getConfig()
const webAddress = publicRuntimeConfig.apiUrl

interface CourierInfo {
  first_name: string
  last_name: string
  phone: string
  vehicle?: string
  rating?: number
  photo?: string
  drive_type?: 'bycicle' | 'foot' | 'bike' | 'car'
}

interface OrderStatus {
  id: string
  status: string
  timestamp: string
  description: string
  completed: boolean
}

interface TrackingData {
  success: boolean
  message?: string
  data?: any
  courier?: CourierInfo
  from_location?: { lat: number; lon: number; address?: string }
  to_location?: { lat: number; lon: number; address?: string }
  order_status?: string
  delivery_time?: string
  order_items?: any[]
  statuses?: OrderStatus[]
  order_number?: string
  estimated_delivery?: string
  total_amount?: number
}

// Component to handle map bounds
function MapBounds({ from, to }: { from?: any; to?: any }) {
  const MapComponent = dynamic(
    () =>
      import('react-leaflet').then((mod) => {
        const { useMap } = mod
        return function InnerMapBounds() {
          const map = useMap()

          useEffect(() => {
            if (typeof window !== 'undefined' && L) {
              // Trigger resize to fix tile loading
              setTimeout(() => {
                map.invalidateSize()

                if (from && to) {
                  const bounds = L.latLngBounds([
                    [from.lat, from.lon],
                    [to.lat, to.lon],
                  ])
                  map.fitBounds(bounds, {
                    padding: [50, 450],
                    maxZoom: 15,
                  })
                } else if (from) {
                  map.setView([from.lat, from.lon], 15)
                } else if (to) {
                  map.setView([to.lat, to.lon], 15)
                }
              }, 100)
            }
          }, [from, to, map])

          return null
        }
      }),
    { ssr: false }
  )

  return <MapComponent />
}

export default function TrackClient({ orderId }: { orderId: string }) {
  const { t: tr } = useTranslation('common')

  const [shouldFetch, setShouldFetch] = useState(true)
  const [trackingInfo, setTrackingInfo] = useState<TrackingData | null>(null)
  const [courierPosition, setCourierPosition] = useState<
    [number, number] | null
  >(null)
  const { user, activeCity } = useUI()
  const { data, isLoading, isError, refetch } = useQuery(
    ['track_order', orderId],
    async () => {
      const { data } = await axios.get(`${webAddress}/api/track/${orderId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('opt_token')}`,
        },
      })
      return data
    },
    {
      refetchInterval: shouldFetch ? 5000 : false,
      refetchOnMount: true,
      enabled: shouldFetch && !!orderId,
    }
  )

  // Default center (Bishkek)
  const defaultCenter: [number, number] = [activeCity?.lat, activeCity?.lon]

  const mapCenter = useMemo(() => {
    if (trackingInfo?.from_location && trackingInfo?.to_location) {
      const lat =
        (trackingInfo.from_location.lat + trackingInfo.to_location.lat) / 2
      const lon =
        (trackingInfo.from_location.lon + trackingInfo.to_location.lon) / 2
      if (!isNaN(lat) && !isNaN(lon)) {
        return [lat, lon] as [number, number]
      }
    } else if (trackingInfo?.from_location) {
      const lat = trackingInfo.from_location.lat
      const lon = trackingInfo.from_location.lon
      if (!isNaN(lat) && !isNaN(lon)) {
        return [lat, lon] as [number, number]
      }
    } else if (trackingInfo?.to_location) {
      const lat = trackingInfo.to_location.lat
      const lon = trackingInfo.to_location.lon
      if (!isNaN(lat) && !isNaN(lon)) {
        return [lat, lon] as [number, number]
      }
    }
    return defaultCenter
  }, [trackingInfo])

  useEffect(() => {
    if (data?.success === false) {
      setShouldFetch(false)
    }

    if (data?.success === true) {
      console.log('Tracking data received:', data)
      setTrackingInfo(data)

      // Set courier location if available
      if (data?.data) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          // If it's an array of coordinates, use the last one
          const lastPoint = data.data[data.data.length - 1]
          if (lastPoint.latitude && lastPoint.longitude) {
            setCourierPosition([lastPoint.latitude, lastPoint.longitude])
          }
        } else if (data.data.latitude && data.data.longitude) {
          setCourierPosition([data.data.latitude, data.data.longitude])
        } else if (data.data.lat && data.data.lon) {
          setCourierPosition([data.data.lat, data.data.lon])
        }
      }
    }
  }, [data])

  // Create custom icons in Les Ailes brand colors
  const fromIcon =
    typeof window !== 'undefined' && L
      ? L.divIcon({
        html: '<div style="background: linear-gradient(135deg, #e91e63 0%, #d81b60 100%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 3px 10px rgba(233, 30, 99, 0.4); border: 2px solid white;">A</div>',
        iconSize: [36, 36],
        className: 'custom-div-icon',
      })
      : null

  const toIcon =
    typeof window !== 'undefined' && L
      ? L.divIcon({
        html: '<div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4); border: 2px solid white;">B</div>',
        iconSize: [36, 36],
        className: 'custom-div-icon',
      })
      : null

  // Select courier icon based on drive_type
  const getCourierIcon = () => {
    if (typeof window === 'undefined' || !L) return null

    const driveType = trackingInfo?.courier?.drive_type
    let IconComponent: any = Truck // default
    let backgroundColor = '#d81b60' // Les Ailes pink

    switch (driveType) {
      case 'bycicle':
      case 'bike':
        IconComponent = Bike
        break
      case 'foot':
        IconComponent = FaPersonWalking
        break
      case 'car':
        IconComponent = Car
        break
      default:
        IconComponent = Truck
    }

    const iconHtml = `
      <div style="
        position: relative;
        width: 50px;
        height: 50px;
      ">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${backgroundColor};
          opacity: 0.3;
          animation: pulse-courier 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${backgroundColor};
          opacity: 0.2;
          animation: pulse-courier 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 1s;
        "></div>
        <div style="
          position: relative;
          background: linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px ${backgroundColor}66;
          border: 2px solid white;
        ">
          ${renderToStaticMarkup(<IconComponent size={22} strokeWidth={2.5} />)}
        </div>
      </div>
      <style>
        @keyframes pulse-courier {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      </style>
    `

    return L.divIcon({
      html: iconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      className: 'custom-courier-icon',
    })
  }

  const courierIcon = getCourierIcon()

  // Format delivery status text
  const getStatusText = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': tr('status_pending') || 'Ожидает подтверждения',
      'confirmed': tr('status_confirmed') || 'Подтвержден',
      'preparing': tr('status_preparing') || 'Готовится',
      'ready': tr('status_ready') || 'Готов к доставке',
      'on_the_way': tr('status_on_the_way') || 'В пути',
      'delivered': tr('status_delivered') || 'Доставлен',
      'cancelled': tr('status_cancelled') || 'Отменен'
    }
    return statusMap[status || ''] || status || tr('status_unknown') || 'Неизвестен'
  }

  // Create route polyline - removed as per requirement

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <div className={styles.loaderIcon}>
            <TruckIcon className="w-16 h-16 text-pink-600 animate-pulse" />
          </div>
          <h2 className={styles.loaderTitle}>
            {tr('loading_tracking_info') || 'Загрузка информации о доставке'}
          </h2>
          <p className={styles.loaderSubtitle}>
            {tr('please_wait') || 'Пожалуйста, подождите...'}
          </p>
        </div>
      </div>
    )
  }

  if (isError || data?.success === false) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <ExclamationCircleIcon className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>
            {tr('order_not_found') || 'Заказ не найден'}
          </h2>
          <p className={styles.errorMessage}>
            {tr('order_not_found_message') || 'Проверьте номер заказа и попробуйте снова'}
          </p>
          <button
            onClick={() => refetch()}
            className={styles.retryButton}
          >
            {tr('retry') || 'Повторить'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Map takes full screen */}
      <div className={styles.mapSection}>
        {typeof window !== 'undefined' && mapCenter && (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
            whenCreated={(map: any) => {
              setTimeout(() => {
                map.invalidateSize()
              }, 100)
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Add map bounds handler */}
            {(trackingInfo?.from_location || trackingInfo?.to_location) && (
              <MapBounds
                from={trackingInfo?.from_location}
                to={trackingInfo?.to_location}
              />
            )}

            {/* From location marker */}
            {trackingInfo?.from_location && fromIcon && (
              <Marker
                position={[
                  trackingInfo.from_location.lat,
                  trackingInfo.from_location.lon,
                ]}
                icon={fromIcon}
              />
            )}

            {/* To location marker */}
            {trackingInfo?.to_location && toIcon && (
              <Marker
                position={[
                  trackingInfo.to_location.lat,
                  trackingInfo.to_location.lon,
                ]}
                icon={toIcon}
              />
            )}

            {/* Courier position marker */}
            {courierPosition && courierIcon && (
              <Marker position={courierPosition} icon={courierIcon} />
            )}
          </MapContainer>
        )}
      </div>

      {/* Sidebar overlay */}
      <div className={styles.sidebar}>
        {/* Order Status Card */}
        {trackingInfo?.order_status && (
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <h2 className={styles.statusTitle}>
                {tr('order_status') || 'Статус заказа'}
              </h2>
              {trackingInfo?.order_number && (
                <span className={styles.orderNumber}>#{trackingInfo.order_number}</span>
              )}
            </div>
            <div className={styles.statusBody}>
              <div className={styles.currentStatus}>
                <span className={styles.statusBadge}>
                  {getStatusText(trackingInfo.order_status)}
                </span>
              </div>
              {trackingInfo?.estimated_delivery && (
                <div className={styles.estimatedTime}>
                  <TruckIcon className="w-4 h-4" />
                  <span>{tr('estimated_delivery') || 'Ожидаемая доставка'}: {trackingInfo.estimated_delivery}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Courier Card */}
        {trackingInfo?.courier && (
          <div className={styles.courierCard}>
            <div className={styles.courierHeader}>
              <h2 className={styles.courierTitle}>
                {tr('courier_info') || 'Информация о курьере'}
              </h2>
            </div>
            <div className={styles.courierBody}>
              <div className={styles.courierAvatar}>
                {trackingInfo.courier.photo ? (
                  <img
                    src={trackingInfo.courier.photo}
                    alt="Courier"
                    className={styles.avatarImage}
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className={styles.courierDetails}>
                <h3 className={styles.courierName}>
                  {trackingInfo.courier.first_name}{' '}
                  {trackingInfo.courier.last_name}
                </h3>
                {trackingInfo.courier.rating && (
                  <div className={styles.courierRating}>
                    ⭐ {trackingInfo.courier.rating.toFixed(1)}
                  </div>
                )}
                {trackingInfo.courier.vehicle && (
                  <p className={styles.courierVehicle}>
                    <TruckIcon className="w-4 h-4 mr-1" />
                    {trackingInfo.courier.vehicle}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.courierActions}>
              <a
                href={`tel:${trackingInfo.courier.phone}`}
                className={styles.callButton}
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                {trackingInfo.courier.phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
