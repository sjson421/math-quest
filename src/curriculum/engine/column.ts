/**
 * Column arithmetic, derived once.
 *
 * Every column generator needs the same facts — the digit in each place, what
 * that column comes to, whether it carries or borrows, and what the place above
 * looks like afterwards. Computing them inline is how `add-3digit` ended up
 * abandoning the digit-concatenation idiom the two-digit skills use: the trick
 * does not survive a third place, so the skill quietly grew its own arithmetic.
 *
 * One trace feeds the display, the hint, the solution details and the predicted
 * misconceptions, so those four cannot disagree with each other.
 */

/** Digit at position `place` (0 = ones, 1 = tens, ...). */
export const digitAt = (value: number, place: number) =>
  Math.floor(Math.abs(value) / 10 ** place) % 10

const width = (value: number) => Math.abs(value).toString().length

export type ColumnOperator = '+' | '−'

export type ColumnPlace = {
  /** 0 = ones, 1 = tens, 2 = hundreds. */
  place: number
  /** Digit of the first operand in this place. */
  top: number
  /** Digit of the second operand in this place. */
  bottom: number
  /** Carry (addition) or borrow (subtraction) arriving from the place below. */
  incoming: number
  /**
   * `top + bottom` with nothing else applied. Addition only, and deliberately
   * separate from `total`: a learner adding a column sees this number first,
   * and the carrying skill's hint is about exactly this value exceeding 9.
   */
  raw: number
  /** The column's value once the incoming carry is included. Addition only. */
  total: number
  /** `top` after lending a ten upward. Subtraction only. */
  reduced: number
  /** `reduced` plus the ten borrowed from above, when this column borrows. */
  borrowed: number
  /** The digit written in this place. */
  digit: number
  /** 1 when this column carries or borrows, else 0. */
  carry: number
}

export type ColumnTrace = {
  a: number
  b: number
  operator: ColumnOperator
  /** Ones first, so `places[0]` is always the rightmost column. */
  places: ColumnPlace[]
  result: number
}

/**
 * Trace `a` op `b` column by column, right to left.
 *
 * Subtraction assumes `a >= b` — every subtraction skill in the course either
 * constrains its draw that way or has moved on to negatives, where columns are
 * no longer how the work is done.
 */
export function columnTrace(a: number, b: number, operator: ColumnOperator): ColumnTrace {
  const places: ColumnPlace[] = []
  const count = Math.max(width(a), width(b))
  let incoming = 0

  for (let place = 0; place < count; place += 1) {
    const top = digitAt(a, place)
    const bottom = digitAt(b, place)

    if (operator === '+') {
      const raw = top + bottom
      const total = raw + incoming
      const carry = total > 9 ? 1 : 0
      places.push({
        place,
        top,
        bottom,
        incoming,
        raw,
        total,
        reduced: top,
        borrowed: top,
        digit: total % 10,
        carry,
      })
      incoming = carry
    } else {
      const reduced = top - incoming
      const carry = reduced < bottom ? 1 : 0
      const borrowed = reduced + carry * 10
      places.push({
        place,
        top,
        bottom,
        incoming,
        raw: top - bottom,
        total: borrowed - bottom,
        reduced,
        borrowed,
        digit: borrowed - bottom,
        carry,
      })
      incoming = carry
    }
  }

  return {
    a,
    b,
    operator,
    places,
    result: operator === '+' ? a + b : a - b,
  }
}

/** The place-`n` column, or `undefined` where the operands do not reach it. */
export const at = (trace: ColumnTrace, place: number): ColumnPlace | undefined =>
  trace.places[place]

/** The place-`n` column, throwing where a skill assumed a width it does not have. */
export function place(trace: ColumnTrace, n: number): ColumnPlace {
  const found = trace.places[n]
  if (!found) {
    throw new Error(
      `${trace.a} ${trace.operator} ${trace.b} has ${trace.places.length} columns, no place ${n}`,
    )
  }
  return found
}
