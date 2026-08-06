import type { Misconception } from '../../lib/types'
import { digitAt, digitWidth } from './column'

/**
 * Long division, derived once.
 *
 * Not another `ColumnOperator`. A column trace pairs a top and a bottom digit in
 * each place and writes one digit per column; long division takes one digit at a
 * time from the dividend, divides a value that spans the previous remainder as
 * well as that digit, and subtracts a product rather than a digit. The two have
 * the shape of a loop over places in common and nothing else.
 *
 * The steps run highest place first, which is the order the work is done — the
 * same principle as `multiplicationTrace`'s ones-first ordering, applied to an
 * algorithm that runs the other way.
 */

/** One quotient digit: what was brought down, divided, written and left over. */
export type DivisionStep = {
  /** 0 = ones. Steps arrive highest place first, so `place` counts down. */
  place: number
  /** The dividend digit brought down into this step. */
  broughtDown: number
  /**
   * The value actually divided here: the previous remainder shifted one place,
   * plus the digit brought down.
   *
   * The reason `broughtDown` alone is not enough. Dividing the digit on its own
   * is the error `ignoredStepRemainder` predicts, and a trace that only recorded
   * the digit could not tell the two apart.
   */
  working: number
  /** The quotient digit written above this place. */
  digit: number
  /** `digit × divisor` — what is taken away from `working`. */
  product: number
  /** `working − product`, carried into the next step. */
  remainder: number
}

export type DivisionTrace = {
  dividend: number
  divisor: number
  /** Highest place first, matching the order the work is done. */
  steps: DivisionStep[]
  quotient: number
  /** What is left when the last step is done. Zero for an exact division. */
  remainder: number
}

function requireWhole(name: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative safe integer, got ${value}`)
  }
}

/** Trace a whole number divided by a whole number, one quotient digit per step. */
export function divisionTrace(dividend: number, divisor: number): DivisionTrace {
  requireWhole('dividend', dividend)
  requireWhole('divisor', divisor)
  if (divisor === 0) throw new Error('divisor must not be zero')

  const steps: DivisionStep[] = []
  let remainder = 0

  // One step per dividend digit, including the leading ones that divide to zero.
  // Dropping those would lose the place they occupy, and a quotient rebuilt from
  // the remaining digits would be ten times too large.
  for (let place = digitWidth(dividend) - 1; place >= 0; place -= 1) {
    const broughtDown = digitAt(dividend, place)
    const working = remainder * 10 + broughtDown
    const digit = Math.floor(working / divisor)
    const product = digit * divisor
    remainder = working - product
    steps.push({ place, broughtDown, working, digit, product, remainder })
  }

  return {
    dividend,
    divisor,
    steps,
    quotient: Math.floor(dividend / divisor),
    remainder,
  }
}

/** The step writing the place-`n` quotient digit, with a problem-specific failure. */
export function divisionStep(trace: DivisionTrace, n: number): DivisionStep {
  const step = trace.steps.find((s) => s.place === n)
  if (!step) {
    throw new Error(
      `${trace.dividend} ÷ ${trace.divisor} writes no quotient digit in place ${n}`,
    )
  }
  return step
}

/**
 * The two values alone, for a draw predicate that has to reject the operands
 * where they would be useless.
 *
 * Exported for the same reason `misalignedValue` is: `long-div-1digit` needs to
 * know whether its two diagnoses will be distinct *before* the problem exists,
 * and computing either a second time in the generator is how the two would
 * drift apart.
 */
export const forgotBringDownValue = (trace: DivisionTrace) => Math.floor(trace.quotient / 10)

export const ignoredStepRemainderValue = (trace: DivisionTrace) =>
  trace.steps.reduce(
    (digits, step) => digits * 10 + Math.floor(step.broughtDown / trace.divisor),
    0,
  )

/**
 * Stopped before the last step, so the final digit was never brought down.
 *
 * The quotient without its last digit. Expressed as arithmetic on the quotient
 * rather than as a truncated string so it stays well-formed at any width.
 */
export function forgotBringDown(trace: DivisionTrace, nudge: string): Misconception {
  if (trace.quotient < 10) {
    // Below ten the truncated quotient is a single digit's worth short and the
    // prediction is indistinguishable from arithmetic noise; worse, a quotient
    // under ten makes it zero, which no learner writes. Loud beats a wall whose
    // second diagnosis is 0 on every problem.
    throw new Error(
      `${trace.dividend} ÷ ${trace.divisor} has a one-digit quotient and cannot lose a bring-down`,
    )
  }

  return {
    value: forgotBringDownValue(trace),
    tag: 'forgot-bring-down',
    nudge,
  }
}

/**
 * Divided each digit brought down on its own, never carrying a step's remainder
 * into the next one.
 *
 * The error the algorithm exists to prevent, and the reason `working` is on the
 * step rather than being recomputed: this is the same loop with `remainder * 10`
 * dropped from it.
 */
export function ignoredStepRemainder(
  trace: DivisionTrace,
  nudge: string,
): Misconception {
  if (trace.steps.every((step) => step.remainder === 0)) {
    // Every step dividing cleanly makes this value the quotient itself, which
    // the central filter drops — leaving a wall with one diagnosis. The draw is
    // supposed to guarantee a non-zero intermediate remainder; say so here
    // rather than shipping a skill that silently predicts nothing.
    throw new Error(
      `${trace.dividend} ÷ ${trace.divisor} leaves no step remainder to ignore`,
    )
  }

  const value = ignoredStepRemainderValue(trace)

  if (value === 0) {
    // Every dividend digit smaller than the divisor, so the wrong method writes
    // nothing at all. Nobody submits 0 for a three-digit division, and a
    // prediction nobody can land on is not a diagnosis. The draw avoids this by
    // keeping the leading digit at or above the divisor.
    throw new Error(
      `${trace.dividend} ÷ ${trace.divisor} divides no digit on its own, so the value is 0`,
    )
  }

  return { value, tag: 'ignored-step-remainder', nudge }
}
