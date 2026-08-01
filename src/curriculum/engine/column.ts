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
  /**
   * `top` after lending a ten downward. Subtraction only, and **meaningless
   * where this column itself borrows** — it means "after lending, before
   * receiving", and a borrow chain receives first. In `500 − 237` the tens
   * column reads −1 here, which is arithmetically consistent and is not a digit
   * anybody writes. Use `borrowed` wherever `carry` is 1; see `borrowChain`.
   */
  reduced: number
  /**
   * The digit standing over this column once every borrow has passed through —
   * what the learner crosses out and rewrites. Correct at any chain length,
   * which `reduced` is not.
   */
  borrowed: number
  /** The digit written in this place. */
  digit: number
  /**
   * 1 when this column carries or borrows, else 0.
   *
   * Two digits cannot reach 20, so a binary carry is a flag and reads as one at
   * every call site. That stops being true the moment a third operand joins —
   * see `StackPlace`, where it is a count.
   */
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

/**
 * Adding a stack of operands, traced the same way.
 *
 * A separate trace rather than `columnTrace` widened, because half of
 * `ColumnPlace` is subtraction vocabulary: `reduced` and `borrowed` describe
 * lending a ten between two numbers and have no meaning over a stack, and
 * `top`/`bottom` have no N-operand form either. Widening would put four fields
 * on the type that are only valid at width two, which is a worse type than two
 * honest ones.
 *
 * The shared field names are deliberate. `add-2digit-carry` and
 * `add-three-numbers` say almost the same sentences to the learner, so `raw`,
 * `total` and `digit` mean here exactly what they mean there.
 */
export type StackPlace = {
  /** 0 = ones, 1 = tens, 2 = hundreds. */
  place: number
  /** This place's digit from each operand, in operand order. */
  digits: number[]
  /**
   * Carry arriving from the place below — a count, not a flag. Three digits
   * plus an incoming carry can reach 29, so this is 0, 1 or 2.
   */
  incoming: number
  /** The digits summed, before the incoming carry. */
  raw: number
  /** `raw` once the incoming carry is included. */
  total: number
  /** The digit written in this place. */
  digit: number
  /** How many tens this column sends up. 2 is normal here. */
  carry: number
}

/**
 * Addition only, so there is no `operator` field — a borrow chain through three
 * operands is not a thing the course teaches, and a field whose type admits one
 * value tells a call site to expect a switch that is never coming.
 */
export type StackTrace = {
  operands: number[]
  /** Ones first, so `places[0]` is always the rightmost column. */
  places: StackPlace[]
  result: number
}

/** Trace the sum of `operands` column by column, right to left. */
export function stackTrace(operands: number[]): StackTrace {
  const places: StackPlace[] = []
  const count = Math.max(...operands.map(width))
  let incoming = 0

  for (let place = 0; place < count; place += 1) {
    const digits = operands.map((operand) => digitAt(operand, place))
    const raw = digits.reduce((sum, digit) => sum + digit, 0)
    const total = raw + incoming
    const carry = Math.floor(total / 10)

    places.push({ place, digits, incoming, raw, total, digit: total % 10, carry })
    incoming = carry
  }

  return { operands, places, result: operands.reduce((sum, operand) => sum + operand, 0) }
}

/**
 * What the carry-dropping misconception needs, and nothing more.
 *
 * Structural so that both traces satisfy it: the prediction is
 * `result − carry × 10^(n+1)`, which was already right at any carry size. Only
 * the parameter type stood between it and a stack.
 */
export type CarryingTrace = {
  result: number
  places: readonly { carry: number }[]
}

/** The place-`n` column, or `undefined` where the operands do not reach it. */
export const at = (trace: ColumnTrace, place: number): ColumnPlace | undefined =>
  trace.places[place]

/**
 * Shared by every place accessor, including `forgotCarry`'s.
 *
 * `describe` is a thunk so the message is built only when it is thrown. These
 * run inside draw predicates, which retry, so formatting a string per lookup on
 * the success path is work nobody ever reads.
 */
export function requirePlace<P>(places: readonly P[], n: number, describe: () => string): P {
  const found = places[n]
  if (!found) {
    throw new Error(`${describe()} has ${places.length} columns, no place ${n}`)
  }
  return found
}

/** The place-`n` column, throwing where a skill assumed a width it does not have. */
export function place(trace: ColumnTrace, n: number): ColumnPlace {
  return requirePlace(trace.places, n, () => `${trace.a} ${trace.operator} ${trace.b}`)
}

/** As `place()`, for a stack. */
export function stackPlace(trace: StackTrace, n: number): StackPlace {
  return requirePlace(trace.places, n, () => trace.operands.join(' + '))
}

/**
 * Where the ten a column borrows actually comes from.
 *
 * A borrow does not always come from the column immediately above. Asked for a
 * ten, a column standing at zero has none to give, so the request travels until
 * it reaches one that does — and that column, not the adjacent one, is the one
 * the learner crosses out and reduces. Every column in between ends up standing
 * at nine.
 *
 * The trace already holds every value this describes; what it cannot say is
 * *which* column finally lent, and that is the entire subject of
 * `sub-across-zero`'s hint and solution. Two skills phrase a borrow, so this is
 * shared rather than walked inside one generator.
 */
export type BorrowChain = {
  /**
   * Columns the borrow passed through without any of them being able to lend,
   * nearest the borrowing column first. Empty for an ordinary single borrow.
   * Each stands at `borrowed` — nine — afterwards.
   */
  through: ColumnPlace[]
  /** The column that lends, standing at its `reduced` value afterwards. */
  lender: ColumnPlace
}

/**
 * Follow the borrow out of place `from` to the column that pays for it.
 *
 * Throws where `from` does not borrow, rather than returning an empty chain: a
 * caller asking about a borrow that never happened has the wrong problem, and a
 * silent answer would be phrased into a hint.
 */
export function borrowChain(trace: ColumnTrace, from: number): BorrowChain {
  const start = place(trace, from)
  if (start.carry !== 1) {
    throw new Error(`${trace.a} ${trace.operator} ${trace.b} does not borrow at place ${from}`)
  }

  const through: ColumnPlace[] = []
  for (let n = from + 1; n < trace.places.length; n += 1) {
    const column = trace.places[n]
    // A column that borrows in turn had nothing to lend of its own.
    if (column.carry === 1) {
      through.push(column)
      continue
    }
    return { through, lender: column }
  }

  // Unreachable while `a >= b`, which every subtraction skill in the course
  // guarantees: the top number would have to be the smaller one.
  throw new Error(`${trace.a} ${trace.operator} ${trace.b} borrows past its last column`)
}
