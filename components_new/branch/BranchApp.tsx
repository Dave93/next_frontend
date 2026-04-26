'use client'

import axios from 'axios'
import { useEffect, useMemo, useState, FC } from 'react'
import dynamic from 'next/dynamic'
import { useLocationStore } from '../../lib/stores/location-store'
import { useLocale } from 'next-intl'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import ChooseCityDropDownApp from '../header/ChooseCityDropDownApp'

const webAddress = process.env.NEXT_PUBLIC_API_URL

const BranchMap = dynamic(() => import('./BranchMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{ width: '100%', height: 500 }}
      className="bg-gray-100 flex items-center justify-center"
    >
      Загрузка карты...
    </div>
  ),
})

type Branch = {
  id: number | string
  name?: string
  name_uz?: string
  name_en?: string
  desc?: string
  desc_uz?: string
  desc_en?: string
  location?: { lat: number; lon: number } | null
  [key: string]: unknown
}

const BranchApp: FC = () => {
  const locale = useLocale()
  const activeCity = useLocationStore((s) => s.activeCity)
  const [zoom] = useState(11)
  const [branches, setBranches] = useState<Branch[]>([])
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null)

  const mapState = useMemo(() => {
    return {
      center: activeBranch?.location
        ? ([activeBranch.location.lat, activeBranch.location.lon] as [
            number,
            number,
          ])
        : ([
            Number(activeCity?.lat) || 41.2995,
            Number(activeCity?.lon) || 69.2401,
          ] as [number, number]),
      zoom: activeBranch ? 17 : zoom,
    }
  }, [activeBranch, activeCity, zoom])

  useEffect(() => {
    if (!activeCity?.id) return
    let cancelled = false
    const fetchBranches = async () => {
      try {
        const { data } = await axios.get(
          `${webAddress}/api/terminals/pickup?city_id=${activeCity.id}`
        )
        if (!cancelled) setBranches(data.data || [])
      } catch {
        if (!cancelled) setBranches([])
      }
    }
    fetchBranches()
    return () => {
      cancelled = true
    }
  }, [activeCity])

  const localizedName = (b: Branch) => {
    if (locale === 'uz') return b.name_uz
    if (locale === 'en') return b.name_en
    return b.name
  }
  const localizedDesc = (b: Branch) => {
    if (locale === 'uz') return b.desc_uz
    if (locale === 'en') return b.desc_en
    return b.desc
  }

  return (
    <div className="flex md:flex-row flex-col justify-between pt-10 gap-10">
      <div className="md:flex-[4] md:mb-0 mb-10">
        <BranchMap branches={branches} mapState={mapState} />
      </div>
      <div className="md:flex-[2] space-y-2 mb-4 md:mb-0 px-4">
        <ChooseCityDropDownApp />
        <SimpleBar style={{ maxHeight: 500 }}>
          <div className="space-y-2 overflow-y-auto">
            {branches.map((branch) => (
              <div
                className={`border-1 border rounded-md p-4 cursor-pointer ${
                  activeBranch != null && activeBranch.id === branch.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary hover:text-white'
                }`}
                key={branch.id}
                onClick={() => {
                  if (activeBranch != null && activeBranch.id === branch.id) {
                    setActiveBranch(null)
                  } else {
                    setActiveBranch(branch)
                  }
                }}
              >
                <div className="text-xl font-bold">{localizedName(branch)}</div>
                <div className="whitespace-pre-line">
                  {localizedDesc(branch)}
                </div>
              </div>
            ))}
          </div>
        </SimpleBar>
      </div>
    </div>
  )
}

export default BranchApp
