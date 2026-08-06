import { describe, expect, it } from 'vitest'
import {
  divisionStep,
  divisionTrace,
  forgotBringDown,
  ignoredStepRemainder,
} from './division'

describe('divisionTrace', () => {
  it('divides the remainder carried in, not the digit brought down', () => {
    const trace = divisionTrace(936, 4)

    expect(divisionStep(trace, 2)).toMatchObject({
      broughtDown: 9,
      working: 9,
      digit: 2,
      product: 8,
      remainder: 1,
    })
    // 13, not 3: the ones-step of the previous column lent its remainder up.
    expect(divisionStep(trace, 1)).toMatchObject({
      broughtDown: 3,
      working: 13,
      digit: 3,
      product: 12,
      remainder: 1,
    })
    expect(divisionStep(trace, 0)).toMatchObject({ broughtDown: 6, working: 16, digit: 4 })
    expect(trace).toMatchObject({ quotient: 234, remainder: 0 })
  })

  it('keeps a leading step that divides to zero, so places are not lost', () => {
    // 3 ÷ 4 writes nothing a learner records, but the step holds the hundreds
    // place. Dropping it would rebuild the quotient ten times too large.
    const trace = divisionTrace(312, 4)

    expect(trace.steps).toHaveLength(3)
    expect(divisionStep(trace, 2)).toMatchObject({ working: 3, digit: 0, remainder: 3 })
    expect(trace.quotient).toBe(78)
  })

  it('carries a final remainder when the division is not exact', () => {
    const trace = divisionTrace(937, 4)

    expect(trace).toMatchObject({ quotient: 234, remainder: 1 })
    expect(trace.steps.at(-1)).toMatchObject({ working: 17, digit: 4, product: 16, remainder: 1 })
  })

  it('handles a two-digit divisor', () => {
    const trace = divisionTrace(912, 24)

    expect(trace).toMatchObject({ quotient: 38, remainder: 0 })
    expect(divisionStep(trace, 1)).toMatchObject({ working: 91, digit: 3, product: 72, remainder: 19 })
    expect(divisionStep(trace, 0)).toMatchObject({ working: 192, digit: 8, product: 192, remainder: 0 })
  })

  it('reconstructs the dividend from quotient, divisor and remainder', () => {
    for (let dividend = 1; dividend <= 999; dividend += 1) {
      for (const divisor of [2, 3, 4, 7, 9, 24, 37]) {
        const trace = divisionTrace(dividend, divisor)

        expect(trace.quotient * divisor + trace.remainder).toBe(dividend)
        // And the quotient really is the digits the steps wrote, in their places.
        const fromSteps = trace.steps.reduce(
          (sum, step) => sum + step.digit * 10 ** step.place,
          0,
        )
        expect(fromSteps).toBe(trace.quotient)
      }
    }
  })

  it('names the division when a place writes no quotient digit', () => {
    expect(() => divisionStep(divisionTrace(84, 4), 2)).toThrow(
      '84 ÷ 4 writes no quotient digit in place 2',
    )
  })

  it('rejects a zero divisor and a negative dividend', () => {
    expect(() => divisionTrace(84, 0)).toThrow('divisor must not be zero')
    expect(() => divisionTrace(-84, 4)).toThrow('dividend must be a non-negative safe integer')
  })
})

describe('division misconception factories', () => {
  it('drops the final quotient digit when a bring-down is forgotten', () => {
    const trace = divisionTrace(936, 4)

    expect(forgotBringDown(trace, 'n')).toMatchObject({
      value: 23,
      tag: 'forgot-bring-down',
    })
  })

  it('divides each digit alone when a step remainder is ignored', () => {
    // 9 ÷ 4 = 2, 3 ÷ 4 = 0, 6 ÷ 4 = 1, written side by side.
    const trace = divisionTrace(936, 4)

    expect(ignoredStepRemainder(trace, 'n')).toMatchObject({
      value: 201,
      tag: 'ignored-step-remainder',
    })
  })

  it('predicts two distinct values on the same division', () => {
    // The pair the algorithm wall depends on. Distinct here and distinct from
    // the quotient, which is what keeps two diagnoses after central filtering.
    const trace = divisionTrace(936, 4)
    const bringDown = forgotBringDown(trace, 'n').value
    const stepRemainder = ignoredStepRemainder(trace, 'n').value

    expect(new Set([bringDown, stepRemainder, trace.quotient]).size).toBe(3)
  })

  it('refuses a one-digit quotient rather than predicting zero', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase:
    // silently returning 0 here would give the wall a diagnosis nobody can land on.
    expect(() => forgotBringDown(divisionTrace(8, 4), 'n')).toThrow(
      '8 ÷ 4 has a one-digit quotient and cannot lose a bring-down',
    )
  })

  it('refuses a division whose every step divides cleanly', () => {
    // 486 ÷ 2: 4, 8 and 6 each halve exactly, so the wrong method reaches the
    // right answer and the central filter would drop the prediction.
    expect(() => ignoredStepRemainder(divisionTrace(486, 2), 'n')).toThrow(
      '486 ÷ 2 leaves no step remainder to ignore',
    )
  })

  it('refuses a division no digit of which the divisor fits into', () => {
    expect(() => ignoredStepRemainder(divisionTrace(312, 4), 'n')).toThrow(
      '312 ÷ 4 divides no digit on its own, so the value is 0',
    )
  })
})
