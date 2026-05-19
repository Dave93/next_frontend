import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'

const BUSINESS_ZONE = 'Asia/Tashkent'

export function isWithinWorkHours(
  workTimeStart: number | string | undefined | null,
  workTimeEnd: number | string | undefined | null
): boolean {
  if (
    workTimeStart === undefined ||
    workTimeStart === null ||
    workTimeStart === ''
  ) {
    return true
  }
  const start = Number(workTimeStart)
  const end = Number(workTimeEnd)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return true
  const hour = DateTime.now().setZone(BUSINESS_ZONE).hour
  if (start === end) return true
  if (start < end) return hour >= start && hour < end
  return hour >= start || hour < end
}

export function useIsWithinWorkHours(
  workTimeStart: number | string | undefined | null,
  workTimeEnd: number | string | undefined | null
): boolean {
  const [open, setOpen] = useState(() =>
    isWithinWorkHours(workTimeStart, workTimeEnd)
  )
  useEffect(() => {
    const tick = () => setOpen(isWithinWorkHours(workTimeStart, workTimeEnd))
    tick()
    const now = DateTime.now().setZone(BUSINESS_ZONE)
    const msToNextMinute = (60 - now.second) * 1000 - now.millisecond
    let intervalId: ReturnType<typeof setInterval> | undefined
    const timeoutId = setTimeout(() => {
      tick()
      intervalId = setInterval(tick, 60_000)
    }, Math.max(msToNextMinute, 1000))
    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [workTimeStart, workTimeEnd])
  return open
}
