'use client'

import { FC, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'

const webAddress = process.env.NEXT_PUBLIC_API_URL

async function fetchStopList(terminalId: number): Promise<number[]> {
  const { data } = await axios.get(
    `${webAddress}/api/terminals/get_stock?terminal_id=${terminalId}`,
    { withCredentials: true }
  )
  if (!data?.success) return []
  return Array.isArray(data.data) ? data.data : []
}

const StopListHydrator: FC = () => {
  const terminalId = useLocationStore(
    (s) => s.locationData?.terminal_id ?? s.locationData?.terminalData?.id ?? null
  )
  const setStopProducts = useUIStore((s) => s.setStopProducts)

  const { data } = useQuery({
    queryKey: ['stop-list', terminalId],
    queryFn: () => fetchStopList(terminalId as number),
    enabled: !!terminalId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (!terminalId) {
      setStopProducts([])
      return
    }
    if (data) setStopProducts(data)
  }, [terminalId, data, setStopProducts])

  return null
}

export default StopListHydrator
