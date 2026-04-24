'use client'

import { FC, useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

type Props = {
  center: [number, number]
  coords: number[] | null
  onPick: (lat: number, lon: number) => void
  height?: number
}

const LocationMap: FC<Props> = ({ center, coords, onPick, height = 280 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick

  // create the map exactly once per mount; cleanup fully tears down so
  // strict-mode double-mount doesn't see a stale leaflet instance.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false
    let map: any = null
    const init = () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const L: any = require('leaflet')
      if (cancelled || !containerRef.current) return
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      })
      // if a previous instance is still glued to the node, kill it
      const node = containerRef.current as any
      if (node._leaflet_id) node._leaflet_id = null
      map = L.map(containerRef.current, {
        center: (coords && coords.length === 2 ? coords : center) as any,
        zoom: 13,
        scrollWheelZoom: false,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)
      map.on('click', (e: any) => {
        onPickRef.current(e.latlng.lat, e.latlng.lng)
      })

      // "Locate me" button — top-right
      const LocateControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd() {
          const btn = L.DomUtil.create(
            'button',
            'leaflet-bar leaflet-control'
          )
          btn.type = 'button'
          btn.title = 'Определить мою локацию'
          btn.style.cssText =
            'width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:#fff;border:none;cursor:pointer;'
          btn.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAAF04" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'
          L.DomEvent.disableClickPropagation(btn)
          btn.addEventListener('click', () => {
            if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition(
              (pos) =>
                onPickRef.current(pos.coords.latitude, pos.coords.longitude),
              () => {}
            )
          })
          return btn
        },
      })
      map.addControl(new LocateControl())

      mapRef.current = map
      setTimeout(() => map?.invalidateSize(), 50)
    }
    init()
    return () => {
      cancelled = true
      if (map) map.remove()
      else if (mapRef.current) mapRef.current.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // intentionally exclude center/coords — handled in separate effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // sync marker + view to coords
  useEffect(() => {
    const map = mapRef.current
    if (!map || !coords || coords.length !== 2) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L: any = require('leaflet')
    if (markerRef.current) {
      markerRef.current.setLatLng(coords as any)
    } else {
      markerRef.current = L.marker(coords as any).addTo(map)
    }
    map.setView(coords as any, Math.max(map.getZoom(), 15), { animate: true })
  }, [coords?.[0], coords?.[1]])

  // recenter when activeCity changes (and no specific coord chosen)
  useEffect(() => {
    const map = mapRef.current
    if (!map || (coords && coords.length === 2)) return
    map.setView(center as any, 13, { animate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]])

  return (
    <div
      ref={containerRef}
      style={{
        height,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        background: '#F3F4F6',
      }}
    />
  )
}

export default LocationMap
