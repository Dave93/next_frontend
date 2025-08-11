import { City } from '@commerce/types/cities'
import React, { FC, useCallback, useMemo } from 'react'
import Cookies from 'js-cookie'
import { Address } from '@commerce/types/address'

let userData: any = null

let locationData: any = {
  address: '',
  flat: '',
  house: '',
  entrance: '',
  door_code: '',
  deliveryType: 'deliver',
  location: [],
  label: '',
}

let activeCity: City | null = null

let activeCityData: any = Cookies.get('activeCity')
try {
  activeCityData = Buffer.from(activeCityData, 'base64')
  activeCityData = activeCityData.toString()
  activeCityData = JSON.parse(activeCityData)
} catch (e) { }

activeCity = activeCityData

let otpToken: string | null | undefined = Cookies.get('opt_token')

if (typeof window !== 'undefined') {
  if (!otpToken) {
    otpToken = localStorage.getItem('opt_token')
    if (otpToken) {
      Cookies.set('opt_token', otpToken)
    }
  }
}

// Client-side data will be loaded in useEffect to avoid hydration mismatch

interface AnyObject {
  [key: string]: any
}

export interface UserData {
  user_identity: number[]
  user_contact: string
  user_token: string
  try: number
  status: number
  user: AnyObject
}

export interface LocationData {
  address: string
  flat: string
  house: string
  entrance: string
  door_code: string
  deliveryType: 'pickup' | 'deliver'
  location?: number[]
  terminalId?: number
  terminalData?: AnyObject
  label?: string
}

export interface State {
  displaySidebar: boolean
  displayDropdown: boolean
  displayModal: boolean
  sidebarView: string
  modalView: string
  userAvatar: string
  user?: UserData | null
  locationData: LocationData | null
  cities: City[] | null
  activeCity: City | null
  showSignInModal: boolean
  showLocationTabs: boolean
  showMobileLocationTabs: boolean
  locationTabsClosable: boolean
  stopProducts: number[]
  addressId: number | null
  addressList: Address[] | null
}

const initialState = {
  displaySidebar: false,
  displayDropdown: false,
  displayModal: false,
  modalView: 'LOGIN_VIEW',
  sidebarView: 'CART_VIEW',
  userAvatar: '',
  user: null, // Initialize as null to match server-side
  locationData,
  cities: null,
  activeCity: activeCity,
  showSignInModal: false,
  showLocationTabs: false,
  showMobileLocationTabs: false,
  locationTabsClosable: false,
  stopProducts: [],
  addressId: null,
  addressList: null,
}

type Action =
  | {
    type: 'OPEN_SIDEBAR'
  }
  | {
    type: 'CLOSE_SIDEBAR'
  }
  | {
    type: 'OPEN_DROPDOWN'
  }
  | {
    type: 'CLOSE_DROPDOWN'
  }
  | {
    type: 'OPEN_MODAL'
  }
  | {
    type: 'CLOSE_MODAL'
  }
  | {
    type: 'SET_MODAL_VIEW'
    view: MODAL_VIEWS
  }
  | {
    type: 'SET_SIDEBAR_VIEW'
    view: SIDEBAR_VIEWS
  }
  | {
    type: 'SET_USER_AVATAR'
    value: string
  }
  | {
    type: 'SET_USER_DATA'
    value: UserData
  }
  | {
    type: 'SET_LOCATION_DATA'
    value: LocationData
  }
  | {
    type: 'SET_CITIES_DATA'
    value: City[]
  }
  | {
    type: 'SET_ACTIVE_CITY'
    value: City
  }
  | {
    type: 'SHOW_SIGNIN_MODAL'
  }
  | {
    type: 'CLOSE_SIGNIN_MODAL'
  }
  | {
    type: 'SHOW_LOCATION_TABS'
  }
  | {
    type: 'CLOSE_LOCATION_TABS'
  }
  | {
    type: 'SHOW_MOBILE_LOCATION_TABS'
  }
  | {
    type: 'CLOSE_MOBILE_LOCATION_TABS'
  }
  | {
    type: 'SET_LOCATION_TABS_CLOSABLE'
    value: boolean
  }
  | {
    type: 'SET_STOP_PRODUCTS'
    value: number[]
  }
  | {
    type: 'SET_ADDRESS_ID'
    value: number
  }
  | {
    type: 'SET_ADDRESS_LIST'
    value: Address[]
  }
  | {
    type: 'SELECT_ADDRESS'
    value: AnyObject
  }

type MODAL_VIEWS =
  | 'SIGNUP_VIEW'
  | 'LOGIN_VIEW'
  | 'FORGOT_VIEW'
  | 'NEW_SHIPPING_ADDRESS'
  | 'NEW_PAYMENT_METHOD'

type SIDEBAR_VIEWS = 'CART_VIEW' | 'CHECKOUT_VIEW' | 'PAYMENT_METHOD_VIEW'

export const UIContext = React.createContext<State | any>(initialState)

UIContext.displayName = 'UIContext'

function uiReducer(state: State, action: Action) {
  switch (action.type) {
    case 'OPEN_SIDEBAR': {
      return {
        ...state,
        displaySidebar: true,
      }
    }
    case 'CLOSE_SIDEBAR': {
      return {
        ...state,
        displaySidebar: false,
      }
    }
    case 'OPEN_DROPDOWN': {
      return {
        ...state,
        displayDropdown: true,
      }
    }
    case 'CLOSE_DROPDOWN': {
      return {
        ...state,
        displayDropdown: false,
      }
    }
    case 'OPEN_MODAL': {
      return {
        ...state,
        displayModal: true,
        displaySidebar: false,
      }
    }
    case 'CLOSE_MODAL': {
      return {
        ...state,
        displayModal: false,
      }
    }
    case 'SET_MODAL_VIEW': {
      return {
        ...state,
        modalView: action.view,
      }
    }
    case 'SET_SIDEBAR_VIEW': {
      return {
        ...state,
        sidebarView: action.view,
      }
    }
    case 'SET_USER_AVATAR': {
      return {
        ...state,
        userAvatar: action.value,
      }
    }
    case 'SET_USER_DATA': {
      try {
        let userNewData = JSON.stringify(action.value)
        userNewData = Buffer.from(userNewData).toString('base64')
        localStorage.setItem('mijoz', userNewData)
      } catch (e) { }
      if (action.value == null) {
        localStorage.removeItem('mijoz')
        localStorage.removeItem('opt_token')
        Cookies.remove('opt_token')
      }
      return {
        ...state,
        user: action.value,
      }
    }
    case 'SET_LOCATION_DATA': {
      try {
        let locationNewData = JSON.stringify(action.value)
        locationNewData = Buffer.from(locationNewData).toString('base64')
        // set cookies for 30 minutes
        var inFifteenMinutes = new Date(new Date().getTime() + 30 * 60 * 1000)
        Cookies.set('yetkazish', locationNewData, {
          expires: inFifteenMinutes,
        })
        // sessionStorage.setItem('yetkazish', locationNewData)
      } catch (e) { }
      return {
        ...state,
        locationData: action.value,
      }
    }
    case 'SET_CITIES_DATA': {
      return {
        ...state,
        cities: action.value,
      }
    }
    case 'SET_ACTIVE_CITY': {
      try {
        let locationNewData = JSON.stringify(action.value)
        locationNewData = Buffer.from(locationNewData).toString('base64')
        Cookies.set('activeCity', locationNewData)
        var inFifteenMinutes = new Date(new Date().getTime() + 30 * 60 * 1000)
        // Set city_slug cookies for a half hour
        Cookies.set('city_slug', action.value.slug, {
          expires: inFifteenMinutes,
        })
      } catch (e) { }
      return {
        ...state,
        activeCity: action.value,
      }
    }
    case 'SHOW_SIGNIN_MODAL': {
      return {
        ...state,
        showSignInModal: true,
      }
    }
    case 'CLOSE_SIGNIN_MODAL': {
      return {
        ...state,
        showSignInModal: false,
      }
    }
    case 'SHOW_LOCATION_TABS': {
      return {
        ...state,
        showLocationTabs: true,
      }
    }
    case 'CLOSE_LOCATION_TABS': {
      return {
        ...state,
        showLocationTabs: false,
      }
    }
    case 'SHOW_MOBILE_LOCATION_TABS': {
      return {
        ...state,
        showMobileLocationTabs: true,
      }
    }
    case 'CLOSE_MOBILE_LOCATION_TABS': {
      return {
        ...state,
        showMobileLocationTabs: false,
      }
    }
    case 'SET_LOCATION_TABS_CLOSABLE': {
      return {
        ...state,
        locationTabsClosable: action.value,
      }
    }
    case 'SET_STOP_PRODUCTS': {
      return {
        ...state,
        stopProducts: action.value,
      }
    }
    case 'SET_ADDRESS_ID': {
      return {
        ...state,
        addressId: action.value,
      }
    }
    case 'SET_ADDRESS_LIST': {
      return {
        ...state,
        addressList: action.value,
      }
    }
    case 'SELECT_ADDRESS': {
      return {
        ...state,
        locationData: action.value.locationData,
        addressId: action.value.addressId,
      }
    }
  }
}

type UIProviderProps = {
  children?: React.ReactNode
  pageProps?: any
}

export const UIProvider: FC<UIProviderProps> = (props) => {
  if (props.pageProps.currentCity) {
    initialState.activeCity = props.pageProps.currentCity
  }
  const [state, dispatch] = React.useReducer(uiReducer, initialState)
  
  // Load client-side data after mount to avoid hydration mismatch
  React.useEffect(() => {
    let userData = localStorage.getItem('mijoz')
    try {
      if (userData) {
        userData = Buffer.from(userData, 'base64').toString()
        const parsedUserData = JSON.parse(userData)
        dispatch({ type: 'SET_USER_DATA', value: parsedUserData })
      }
    } catch (e) { }

    let locationData = Cookies.get('yetkazish')
    try {
      if (locationData) {
        let locData: any = Buffer.from(locationData, 'base64')
        locData = locData.toString()
        const parsedLocationData = JSON.parse(locData)
        dispatch({ type: 'SET_LOCATION_DATA', value: parsedLocationData })
      }
    } catch (e) { }
  }, [])

  const openSidebar = useCallback(
    () => dispatch({ type: 'OPEN_SIDEBAR' }),
    [dispatch]
  )
  const closeSidebar = useCallback(
    () => dispatch({ type: 'CLOSE_SIDEBAR' }),
    [dispatch]
  )
  const toggleSidebar = useCallback(
    () =>
      state.displaySidebar
        ? dispatch({ type: 'CLOSE_SIDEBAR' })
        : dispatch({ type: 'OPEN_SIDEBAR' }),
    [dispatch, state.displaySidebar]
  )
  const closeSidebarIfPresent = useCallback(
    () => state.displaySidebar && dispatch({ type: 'CLOSE_SIDEBAR' }),
    [dispatch, state.displaySidebar]
  )

  const openDropdown = useCallback(
    () => dispatch({ type: 'OPEN_DROPDOWN' }),
    [dispatch]
  )
  const closeDropdown = useCallback(
    () => dispatch({ type: 'CLOSE_DROPDOWN' }),
    [dispatch]
  )

  const openModal = useCallback(
    () => dispatch({ type: 'OPEN_MODAL' }),
    [dispatch]
  )
  const closeModal = useCallback(
    () => dispatch({ type: 'CLOSE_MODAL' }),
    [dispatch]
  )

  const setUserAvatar = useCallback(
    (value: string) => dispatch({ type: 'SET_USER_AVATAR', value }),
    [dispatch]
  )

  const setModalView = useCallback(
    (view: MODAL_VIEWS) => dispatch({ type: 'SET_MODAL_VIEW', view }),
    [dispatch]
  )

  const setSidebarView = useCallback(
    (view: SIDEBAR_VIEWS) => dispatch({ type: 'SET_SIDEBAR_VIEW', view }),
    [dispatch]
  )

  const setUserData = useCallback(
    (value: UserData) => dispatch({ type: 'SET_USER_DATA', value }),
    [dispatch]
  )

  const setLocationData = useCallback(
    (value: LocationData) => dispatch({ type: 'SET_LOCATION_DATA', value }),
    [dispatch]
  )

  const setCitiesData = useCallback(
    (value: City[]) => dispatch({ type: 'SET_CITIES_DATA', value }),
    [dispatch]
  )

  const setActiveCity = useCallback(
    (value: City) => dispatch({ type: 'SET_ACTIVE_CITY', value }),
    [dispatch]
  )

  const openSignInModal = useCallback(
    () => dispatch({ type: 'SHOW_SIGNIN_MODAL' }),
    [dispatch]
  )

  const closeSignInModal = useCallback(
    () => dispatch({ type: 'CLOSE_SIGNIN_MODAL' }),
    [dispatch]
  )

  const openLocationTabs = useCallback(
    () => dispatch({ type: 'SHOW_LOCATION_TABS' }),
    [dispatch]
  )

  const closeLocationTabs = useCallback(
    () => dispatch({ type: 'CLOSE_LOCATION_TABS' }),
    [dispatch]
  )

  const openMobileLocationTabs = useCallback(
    () => dispatch({ type: 'SHOW_MOBILE_LOCATION_TABS' }),
    [dispatch]
  )

  const closeMobileLocationTabs = useCallback(
    () => dispatch({ type: 'CLOSE_MOBILE_LOCATION_TABS' }),
    [dispatch]
  )

  const setLocationTabsClosable = useCallback(
    (value: boolean) => dispatch({ type: 'SET_LOCATION_TABS_CLOSABLE', value }),
    [dispatch]
  )

  const setStopProducts = useCallback(
    (value: number[]) => dispatch({ type: 'SET_STOP_PRODUCTS', value }),
    [dispatch]
  )

  const setAddressId = useCallback(
    (value: number) => dispatch({ type: 'SET_ADDRESS_ID', value }),
    [dispatch]
  )

  const setAddressList = useCallback(
    (value: Address[]) => dispatch({ type: 'SET_ADDRESS_LIST', value }),
    [dispatch]
  )

  const selectAddress = useCallback(
    (value: Address) => dispatch({ type: 'SELECT_ADDRESS', value }),
    [dispatch]
  )

  const value = useMemo(
    () => ({
      ...state,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      closeSidebarIfPresent,
      openDropdown,
      closeDropdown,
      openModal,
      closeModal,
      setModalView,
      setSidebarView,
      setUserAvatar,
      setUserData,
      setLocationData,
      setCitiesData,
      setActiveCity,
      openSignInModal,
      closeSignInModal,
      openLocationTabs,
      closeLocationTabs,
      openMobileLocationTabs,
      closeMobileLocationTabs,
      setLocationTabsClosable,
      setStopProducts,
      setAddressId,
      setAddressList,
      selectAddress,
    }),
    [state]
  )

  return <UIContext.Provider value={value} {...props} />
}

export const useUI = () => {
  const context = React.useContext(UIContext)
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`)
  }
  return context
}

export const ManagedUIContext: FC<UIProviderProps> = ({
  children,
  pageProps,
}) => <UIProvider pageProps={pageProps}>{children}</UIProvider>
