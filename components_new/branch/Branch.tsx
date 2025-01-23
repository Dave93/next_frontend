import axios from 'axios'
import React, { useEffect } from 'react'
import { FC, memo } from 'react'
import getConfig from 'next/config'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import SimpleBar from 'simplebar-react'
import { YMaps, Map, Placemark } from 'react-yandex-maps'
import 'simplebar/dist/simplebar.min.css'
import ChooseCityDropDown from '@components_new/header/ChooseCityDropDown'
const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

const Branch: FC = () => {
  const { locale } = useRouter()
  const { activeCity } = useUI()
  const [zoom, setZoom] = React.useState(11)
  const [branches, setBranches] = React.useState([])
  const [activeBranch, setActiveBranch] = React.useState<any>(null)

  const mapState = React.useMemo(() => {
    return {
      center: activeBranch
        ? [activeBranch.location.lat, activeBranch.location.lon]
        : [activeCity.lat, activeCity.lon],
      zoom: activeBranch ? 17 : zoom,
    }
  }, [activeBranch, activeCity])

  const fetchBranches = async () => {
    const { data } = await axios.get(
      `${webAddress}/api/terminals/pickup?city_id=${activeCity.id}`
    )

    setBranches(data.data)
  }

  useEffect(() => {
    fetchBranches()
  }, [activeCity])
  // console.log('branches', branches)
  return (
    <div className="flex md:flex-row flex-col justify-between pt-10 gap-10">
      <div className="md:flex-[4] md:mb-0 mb-10">
        <YMaps>
          <Map state={mapState} width={'100%'} height={500}>
            {branches.map((branch: any) => (
              <Placemark
                key={branch.id}
                geometry={[branch.location.lat, branch.location.lon]}
                options={{
                  iconLayout: 'default#image',
                  iconImageHref: '/map_placemark.png',
                  iconImageSize: [50, 55],
                }}
              />
            ))}
          </Map>
        </YMaps>
      </div>
      <div className="md:flex-[2] space-y-2 mb-4 md:mb-0 px-4">
        <ChooseCityDropDown />
        <SimpleBar style={{ maxHeight: 500 }}>
          <div className="space-y-2 overflow-y-auto">
            {branches.map((branch: any) => (
              <div
                className={`border-1 border rounded-md p-4 cursor-pointer ${
                  activeBranch != null && activeBranch.id == branch.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary hover:text-white'
                }`}
                key={branch.id}
                onClick={() => {
                  if (activeBranch != null && activeBranch.id == branch.id) {
                    setActiveBranch(null)
                  } else {
                    setActiveBranch(branch)
                  }
                }}
              >
                <div className="text-xl font-bold">
                  {locale == 'uz'
                    ? branch.name_uz
                    : '' || locale == 'ru'
                    ? branch.name
                    : '' || locale == 'en'
                    ? branch.name_en
                    : ''}
                </div>
                <div>
                  {locale == 'uz'
                    ? branch.desc_uz
                    : '' || locale == 'ru'
                    ? branch.desc
                    : '' || locale == 'en'
                    ? branch.desc_en
                    : ''}
                </div>
              </div>
            ))}
          </div>
        </SimpleBar>
      </div>
    </div>
  )
}

export default memo(Branch)
