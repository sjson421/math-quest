/** One monotonic origin shared by every problem in a timed session. */
export type SessionTiming = Readonly<{
  startedAt: number
}>

export const createSessionTiming = (startedAt: number): SessionTiming => ({ startedAt })

/** Derive elapsed whole seconds from a `performance.now()` millisecond origin. */
export const elapsedSeconds = (timing: SessionTiming, now: number): number =>
  Math.max(0, Math.floor((now - timing.startedAt) / 1_000))

const padSeconds = (value: number): string => String(value).padStart(2, '0')

/** Format a non-negative elapsed duration for the compact lesson clock. */
export const formatElapsed = (seconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(seconds))
  const secondsPart = wholeSeconds % 60
  const minutesPart = Math.floor(wholeSeconds / 60) % 60
  const hoursPart = Math.floor(wholeSeconds / 3_600)

  if (hoursPart > 0)
    return `${hoursPart}:${padSeconds(minutesPart)}:${padSeconds(secondsPart)}`

  return `${minutesPart}:${padSeconds(secondsPart)}`
}
