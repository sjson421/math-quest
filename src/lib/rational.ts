/**
 * Exact rational arithmetic.
 *
 * Everything the learner types is converted to a rational before comparison, so
 * `1/2`, `2/4`, `0.5`, and `.50` all compare equal without any floating-point
 * slop. This is what makes semantic answer checking possible.
 */

export type Rational = { n: number; d: number }

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

/** Reduce to lowest terms and force the sign into the numerator. */
export function rational(n: number, d: number): Rational {
  if (d === 0) throw new Error('rational: zero denominator')
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    throw new Error('rational: non-integer components')
  }
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}

export const fromInt = (n: number): Rational => ({ n, d: 1 })

/** Exact conversion from a decimal string — "0.75" becomes 3/4, not 0.749999. */
export function fromDecimalString(text: string): Rational | null {
  const m = /^(-?)(\d*)(?:\.(\d+))?$/.exec(text)
  if (!m) return null
  const [, sign, whole, frac] = m
  if (whole === '' && !frac) return null
  const digits = (whole || '0') + (frac ?? '')
  const value = Number(digits)
  if (!Number.isSafeInteger(value)) return null
  const denom = 10 ** (frac?.length ?? 0)
  return rational(sign === '-' ? -value : value, denom)
}

export const equals = (a: Rational, b: Rational): boolean => a.n === b.n && a.d === b.d

export const toNumber = (r: Rational): number => r.n / r.d

export const isInteger = (r: Rational): boolean => r.d === 1

/** True when the fraction cannot be reduced further — used by fraction skills. */
export const isSimplified = (n: number, d: number): boolean => gcd(n, d) === 1

export function format(r: Rational): string {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`
}
