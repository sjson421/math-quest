/**
 * Local calendar-day keys and arithmetic.
 *
 * Review dates and streak dates describe days a learner names, not elapsed
 * durations. UTC-midnight arithmetic over validated components keeps daylight-
 * saving changes from shifting a named day.
 */

const DAY_MS = 86_400_000
const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function parseDayKey(value: unknown): Date | undefined {
  if (typeof value !== 'string') return undefined

  const match = DAY_KEY_PATTERN.exec(value)
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)

  return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ? date
    : undefined
}

export function isDayKey(value: unknown): value is string {
  return parseDayKey(value) !== undefined
}

function requireDayKey(value: string): Date {
  const date = parseDayKey(value)
  if (!date) throw new Error(`Invalid calendar day: ${value}`)
  return date
}

function requireSupportedYear(year: number): number {
  if (!Number.isFinite(year) || year < 0 || year > 9999) {
    throw new Error('Calendar day is outside the supported range')
  }

  return year
}

function formatDayKey(date: Date): string {
  const year = requireSupportedYear(date.getUTCFullYear())

  return `${String(year).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

/** Local calendar day. Deliberately not UTC — dates follow the learner. */
export function todayKey(date = new Date()): string {
  const year = requireSupportedYear(date.getFullYear())
  return `${String(year).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function daysBetween(from: string, to: string): number {
  const start = requireDayKey(from)
  const end = requireDayKey(to)
  return Math.round((end.getTime() - start.getTime()) / DAY_MS)
}

/** Add whole named calendar days without using local elapsed milliseconds. */
export function addDays(day: string, amount: number): string {
  if (!Number.isSafeInteger(amount)) throw new Error('Calendar day offset must be a safe integer')

  const date = requireDayKey(day)
  date.setUTCDate(date.getUTCDate() + amount)
  return formatDayKey(date)
}

export function dayBefore(day: string): string {
  return addDays(day, -1)
}
