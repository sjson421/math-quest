import { constrain } from '../../lib/rng'
import type { Rng } from '../../lib/rng'
import type { Band } from './bands'

/**
 * Drawing operands that are worth showing.
 *
 * Every generator picks a pair and rejects the degenerate ones — `x - x`, an
 * operand of 1 where the skill is about combining, a column that does not carry
 * on a carrying skill. The predicate is the skill's real definition, so it stays
 * with the skill; what is shared is the retrying, and reporting which skill ran
 * out of attempts.
 */

export type Pair = { a: number; b: number }

export type DrawOptions = {
  /** Skill id. Named in the error, because `constrain` alone cannot say who failed. */
  label: string
  rng: Rng
  band: Band
  /**
   * Draw the second operand from the first. The subtraction skills need it:
   * `b` has to land below `a` or the problem has no answer at this stage.
   * Omitted, `b` is drawn from the same band as `a`.
   */
  second?: (a: number, rng: Rng) => number
  /** Rejects a candidate pair. Omitted, every pair is accepted. */
  where?: (pair: Pair) => boolean
  attempts?: number
}

export function drawPair({
  label,
  rng,
  band: [min, max],
  second,
  where,
  attempts = 300,
}: DrawOptions): Pair {
  // `a` first, then `b`, always — the draw order is part of what a seed means,
  // so reordering these would repoint every recorded problem in the course.
  const make = (): Pair => {
    const a = rng.int(min, max)
    return { a, b: second ? second(a, rng) : rng.int(min, max) }
  }

  try {
    return constrain(make, where ?? (() => true), attempts)
  } catch {
    throw new Error(
      `${label}: no operand pair passed its constraints in ${attempts} draws from [${min}, ${max}]`,
    )
  }
}
