import type { Answer } from './types'
import { canonicalForm } from './expression'
import { fromDecimalString, fromInt, gcd, rational, toNumber, type Rational } from './rational'

export type ParsedInput =
  | {
      kind: 'rational'
      value: Rational
      wasFraction: boolean
      rawNum?: number
      rawDen?: number
      /** True when the entry was written as a whole part plus a fraction. */
      wasMixed?: boolean
      /** The written whole part of a mixed entry, so the checker can tell a
       * genuine mixed decomposition ("1 3/4") from a value-equal non-mixed
       * one ("0 7/4"). */
      mixedWhole?: number
    }
  | { kind: 'invalid' }

/**
 * Parse whatever the learner typed into an exact rational.
 *
 * Accepts: "12", "-3", "1.5", ".75", "3/4", "-3/4", "1 1/2" (mixed number).
 */
export function parseInput(raw: string): ParsedInput {
  const text = raw.trim().replace(/\s+/g, ' ')
  if (text === '' || text === '-') return { kind: 'invalid' }

  // Mixed number: "1 1/2"
  const mixed = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(text)
  if (mixed) {
    const [, sign, whole, num, den] = mixed
    const d = Number(den)
    if (d === 0) return { kind: 'invalid' }
    const magnitude = Number(whole) * d + Number(num)
    const n = sign === '-' ? -magnitude : magnitude
    return {
      kind: 'rational',
      value: rational(n, d),
      wasFraction: true,
      rawNum: n,
      rawDen: d,
      wasMixed: true,
      mixedWhole: Number(whole),
    }
  }

  // Simple fraction: "3/4"
  const frac = /^(-?\d+)\/(-?\d+)$/.exec(text)
  if (frac) {
    const n = Number(frac[1])
    const d = Number(frac[2])
    if (d === 0) return { kind: 'invalid' }
    return {
      kind: 'rational',
      value: rational(n, d),
      wasFraction: true,
      rawNum: n,
      rawDen: d,
    }
  }

  // Integer or decimal
  const dec = fromDecimalString(text)
  if (dec) return { kind: 'rational', value: dec, wasFraction: false }

  return { kind: 'invalid' }
}

export type CheckResult =
  | { status: 'correct' }
  | { status: 'incorrect' }
  /** Numerically right but not in the form this skill is teaching. */
  | { status: 'not-simplified' }
  /** Numerically right but not written as a mixed number. */
  | { status: 'not-mixed' }
  /** Numerically right but written as a fraction where decimal form is required. */
  | { status: 'not-decimal' }
  /** Numerically right but written as a decimal where fraction form is required. */
  | { status: 'not-fraction' }
  | { status: 'unparseable' }

export function checkAnswer(answer: Answer, raw: string): CheckResult {
  if (answer.kind === 'choice') {
    return raw === answer.id ? { status: 'correct' } : { status: 'incorrect' }
  }

  if (answer.kind === 'expression') {
    const entry = canonicalForm(raw, answer.variable, answer.form)
    if (entry === null) return { status: 'unparseable' }
    // The stored answer is written naturally by the generator, not
    // pre-normalized, so it is canonicalized the same way the entry is.
    const expected = canonicalForm(answer.canonical, answer.variable, answer.form)
    return entry === expected ? { status: 'correct' } : { status: 'incorrect' }
  }

  const parsed = parseInput(raw)
  if (parsed.kind === 'invalid') return { status: 'unparseable' }

  if (answer.kind === 'approx') {
    const diff = Math.abs(toNumber(parsed.value) - answer.value)
    return diff <= answer.tolerance ? { status: 'correct' } : { status: 'incorrect' }
  }

  const expected = rational(answer.n, answer.d)
  const matches = parsed.value.n === expected.n && parsed.value.d === expected.d
  if (!matches) return { status: 'incorrect' }

  // The value is right. Form questions come first: a mixed-form requirement is
  // about the written shape, and the entry must decompose into the same whole
  // part and a proper fraction — "0 7/4" evaluates to 7/4 but is not a mixed
  // number. Only a genuine mixed decomposition reaches the reduction check.
  if (answer.requireMixed) {
    const whole = Math.floor(expected.n / expected.d)
    const isGenuineMixed =
      parsed.wasMixed === true &&
      parsed.mixedWhole === whole &&
      parsed.rawNum !== undefined &&
      parsed.rawDen !== undefined &&
      parsed.rawNum % parsed.rawDen !== 0
    if (!isGenuineMixed) return { status: 'not-mixed' }
  }

  // Decimal/fraction conversion skills teach the notation itself, so retyping
  // the displayed form is the same shape of miss as an unreduced fraction.
  if (answer.requireDecimal && parsed.wasFraction) return { status: 'not-decimal' }
  if (answer.requireFraction && !parsed.wasFraction) return { status: 'not-fraction' }

  // If this skill is specifically teaching simplest form, an unreduced entry
  // like 2/4 is a teachable moment, not a plain failure.
  if (answer.requireSimplified && parsed.wasFraction && parsed.rawNum !== undefined) {
    if (gcd(parsed.rawNum, parsed.rawDen!) !== 1) return { status: 'not-simplified' }
  }

  return { status: 'correct' }
}

/** Convenience for generators: build an exact integer answer. */
export const intAnswer = (value: number): Answer => ({
  kind: 'exact',
  ...fromInt(value),
})
