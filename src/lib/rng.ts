/**
 * Seeded RNG. Every problem is generated from an explicit seed so that any
 * problem the learner sees can be reproduced exactly — which makes bugs
 * debuggable and lets generators be snapshot-tested.
 */

export type Rng = {
  /** Float in [0, 1) */
  next(): number
  /** Integer in [min, max], inclusive both ends */
  int(min: number, max: number): number
  /** Integer in [min, max] excluding any value in `except` */
  intExcept(min: number, max: number, except: number[]): number
  pick<T>(items: readonly T[]): T
  shuffle<T>(items: readonly T[]): T[]
  /** True with probability p (default 0.5) */
  bool(p?: number): boolean
}

export function makeRng(seed: number): Rng {
  let s = seed >>> 0

  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))

  return {
    next,
    int,
    intExcept(min, max, except) {
      const pool: number[] = []
      for (let v = min; v <= max; v++) if (!except.includes(v)) pool.push(v)
      if (pool.length === 0) {
        throw new Error(`intExcept: no values left in [${min}, ${max}]`)
      }
      return pool[Math.floor(next() * pool.length)]
    },
    pick(items) {
      if (items.length === 0) throw new Error('pick: empty array')
      return items[Math.floor(next() * items.length)]
    },
    shuffle(items) {
      const out = [...items]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
    bool(p = 0.5) {
      return next() < p
    },
  }
}

/**
 * Reject-and-retry. Generators produce degenerate problems by chance — `x * 0`,
 * `x * 1`, `5 - 5`, identical operands — which teach nothing and feel broken.
 * Rather than contort the number-picking logic, generate and reject.
 */
export function constrain<T>(
  make: () => T,
  isValid: (value: T) => boolean,
  maxAttempts = 300,
): T {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = make()
    if (isValid(candidate)) return candidate
  }
  throw new Error(`constrain: no valid value after ${maxAttempts} attempts`)
}
