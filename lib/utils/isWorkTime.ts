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
  return start <= hour || end > hour
}
