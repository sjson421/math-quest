export type KeypadKey = string

export type KeypadRules = {
  maxLength?: number
  allowFraction?: boolean
  allowNegative?: boolean
  allowDecimal?: boolean
}

/**
 * Apply one key press to the current entry.
 *
 * Pure, so the caller can run it inside a functional state update. That matters:
 * two taps landing in the same React render would otherwise both read the same
 * stale value and the first digit would be silently dropped — very reachable
 * when someone types quickly on a phone.
 */
export function applyKey(value: string, key: KeypadKey, rules: KeypadRules = {}): string {
  const { maxLength = 10, allowFraction = false, allowNegative = false, allowDecimal = false } = rules

  if (key === 'back') return value.slice(0, -1)
  if (key === 'clear') return ''

  if (key === '-') {
    if (!allowNegative) return value
    // A sign toggle, not a character — you cannot end up with "--5".
    return value.startsWith('-') ? value.slice(1) : `-${value}`
  }

  if (key === '.') {
    if (!allowDecimal) return value
    // One decimal point per number part (so "1/2.5" stays impossible too).
    const currentPart = value.split('/').pop() ?? ''
    if (currentPart.includes('.')) return value
  }

  if (key === '/') {
    if (!allowFraction || value.includes('/')) return value
    // A fraction needs a numerator first.
    if (value === '' || value === '-') return value
  }

  if (value.replace('-', '').length >= maxLength) return value

  return value + key
}
