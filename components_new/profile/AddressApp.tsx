'use client'

import { memo, FC, useEffect, useState } from 'react'
import { Address } from '@commerce/types/address'
import { XIcon, PencilIcon } from '@heroicons/react/solid'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'
import Cookies from 'js-cookie'
import axios from 'axios'
import getAddressList from '@lib/load_addreses'

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const AddressApp: FC = () => {
  const [errorMessage, setErrorMessage] = useState('')

  const addressList = useLocationStore((s) => s.addressList) as any
  const setAddressId = useLocationStore((s) => s.setAddressId)
  const setLocationData = useLocationStore((s) => s.setLocationData) as any
  const setAddressList = useLocationStore((s) => s.setAddressList) as any
  const setLocationTabsClosable = useUIStore((s) => s.setLocationModalClosable)
  const openLocationTabs = useUIStore((s) => s.openLocationModal)
  const openMobileLocationTabs = useUIStore((s) => s.openMobileLocationModal)

  const loadAddresses = async () => {
    const addresses = await getAddressList()
    if (!addresses) {
      setErrorMessage('Необходимо войти в систему')
    } else {
      setAddressList(addresses)
    }
  }

  const addNewAddress = () => {
    setLocationData(null)
    setAddressId(null)
    setLocationTabsClosable(true)
    if (window.innerWidth < 768) {
      openMobileLocationTabs()
    } else {
      openLocationTabs()
    }
    loadAddresses()
  }

  const editAddress = (address: Address) => {
    setLocationData({
      ...address,
      location: [address.lat, address.lon],
    })
    setAddressId(address.id)
    setLocationTabsClosable(true)
    if (window.innerWidth < 768) {
      openMobileLocationTabs()
    } else {
      openLocationTabs()
    }
  }

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      const { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      const inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const deleteAddress = async (addressId: number) => {
    await setCredentials()
    const otpToken = Cookies.get('opt_token')
    const response = await axios.delete(
      `${webAddress}/api/address/${addressId}`,
      {
        headers: {
          Authorization: `Bearer ${otpToken}`,
        },
      }
    )
    if (response.status === 200) {
      loadAddresses()
    }
  }

  useEffect(() => {
    loadAddresses()
    return () => {}
  }, [])

  return (
    <>
      <div className="m-auto my-12 text-2xl w-max md:mt-0">Адрес</div>
      {errorMessage && (
        <div className="text-red-500 text-center">{errorMessage}</div>
      )}
      <div className="w-11/12 md:w-5/12 m-auto">
        {!errorMessage && addressList && addressList.length > 0 && (
          <>
            {addressList.map((item: Address) => (
              <div
                className="flex items-center py-2 px-4 bg-gray-200 rounded-lg justify-between mb-2"
                key={item.id}
              >
                <div className="w-11/12">
                  <div className="text-base">
                    {item.label ? item.label : 'Без названия'}
                  </div>
                  <div className="text-sm">
                    {item.address}
                    {item.house ? ', дом: ' + item.house : ''}
                    {item.flat ? ', кв: ' + item.flat : ''}
                    {item.entrance ? ', подъезд: ' + item.entrance : ''}
                    {item.door_code ? ', код: ' + item.door_code : ''}
                  </div>
                </div>
                <div>
                  <PencilIcon
                    className="text-green-500 w-5 h-5 cursor-pointer"
                    onClick={() => editAddress(item)}
                  />
                  <XIcon
                    className="text-primary w-5 h-5 cursor-pointer"
                    onClick={() => deleteAddress(item.id)}
                  />
                </div>
              </div>
            ))}
          </>
        )}
        {!errorMessage && (!addressList || addressList.length === 0) && (
          <div className="text-center">Адреса не найдены</div>
        )}
        {!errorMessage && (
          <button
            className="py-5 font-medium text-xl bg-green-500 rounded-2xl mt-12 text-white text-center w-full"
            onClick={addNewAddress}
            type="button"
          >
            Добавить адрес
          </button>
        )}
      </div>
    </>
  )
}

export default memo(AddressApp)
