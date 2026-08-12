export type KeypadKey = string

export type KeypadRules = {
  maxLength?: number
  allowFraction?: boolean
  allowNegative?: boolean
  allowDecimal?: boolean
  /**
   * Mixed-number entry: a space separating a whole part from a proper fraction.
   *
   * Implies the fraction slash, which a mixed number always contains. The space
   * key takes the adaptive cell the sign otherwise uses, so a problem declares
   * `allowMixed` or `allowNegative`, never both. Unit 8's mixed answers and the
   * mistakes they predict are positive.
   */
  allowMixed?: boolean
}

/**
 * How an entry reads on screen, as opposed to what it submits.
 *
 * The sign key is labelled `−` and emits `-`, because everything the learner
 * reads uses the typographic minus and the answer checker parses ASCII. Both
 * are right; what is wrong is showing one of them where the other is already on
 * screen. Echoing an entry verbatim beside a problem reading `−3 + −5` puts
 * `-8` in the slot below it — the control disagreeing with itself about what it
 * just did, which is indistinguishable from a broken control.
 *
 * Here rather than in the component, beside `applyKey` which produced the
 * string: one owner for the notation, so the line's tick labels and the pad's
 * entry cannot drift into two answers about the same glyph.
 */
export const entryLabel = (value: string): string => value.replace('-', '−')

/**
 * Apply one key press to the current entry.
 *
 * Pure, so the caller can run it inside a functional state update. That matters:
 * two taps landing in the same React render would otherwise both read the same
 * stale value and the first digit would be silently dropped — very reachable
 * when someone types quickly on a phone.
 */
export function applyKey(value: string, key: KeypadKey, rules: KeypadRules = {}): string {
  const {
    maxLength = 10,
    allowFraction = false,
    allowNegative = false,
    allowDecimal = false,
    allowMixed = false,
  } = rules

  if (key === 'back') return value.slice(0, -1)
  if (key === 'clear') return ''

  if (key === '-') {
    if (!allowNegative) return value
    // A sign toggle, not a character — you cannot end up with "--5".
    return value.startsWith('-') ? value.slice(1) : `-${value}`
  }

  if (key === ' ') {
    // Only where a mixed number can be formed: whole digits first, the space
    // once, then the fraction. Nothing before a digit, nothing after the slash,
    // nothing twice, and no sign-prefixed entry (the pad never offers both).
    if (!allowMixed) return value
    if (value === '' || value.startsWith('-')) return value
    if (value.includes(' ') || value.includes('/')) return value
    return `${value} `
  }

  if (key === '.') {
    if (!allowDecimal) return value
    // One decimal point per number part (so "1/2.5" stays impossible too).
    const currentPart = value.split('/').pop() ?? ''
    if (currentPart.includes('.')) return value
  }

  if (key === '/') {
    // A mixed number always contains a fraction, so mixed entry implies the
    // slash — the same effective rule the pad's key display uses.
    if ((!allowFraction && !allowMixed) || value.includes('/')) return value
    // A fraction needs a numerator first.
    if (value === '' || value === '-' || value.endsWith(' ')) return value
  }

  // Mixed entry adds one separator, so exclude only that new space from the
  // established non-sign character limit. Slashes and decimal points keep
  // consuming the limit exactly as they did before mixed entry existed.
  if (value.replace(/[- ]/g, '').length >= maxLength) return value

  return value + key
}
