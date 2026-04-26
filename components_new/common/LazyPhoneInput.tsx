'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

// react-phone-number-input/input is ~152 KB raw / ~37 KB gz. It used to
// land in the shared chunk because SmallCartMobileApp imports it and
// SmallCartMobileApp ships in the layout. Dynamic-import keeps it out of
// the initial bundle until the form actually mounts.
type InputModule = typeof import('react-phone-number-input/input')

const PhoneInputBase = dynamic<ComponentProps<InputModule['default']>>(
  () => import('react-phone-number-input/input'),
  { ssr: false }
)

export default PhoneInputBase
