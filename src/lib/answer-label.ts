import { coordinateLabel } from './coordinate-plane'
import { entryLabel } from './keypad'
import { format, rational } from './rational'
import type { Answer, Choice } from './types'

function decimalLabel(value: { n: number; d: number }): string {
  const normalized = rational(value.n, value.d)
  let denominator = normalized.d
  let twos = 0
  let fives = 0

  while (denominator % 2 === 0) {
    denominator /= 2
    twos += 1
  }
  while (denominator % 5 === 0) {
    denominator /= 5
    fives += 1
  }

  if (denominator !== 1) return format(normalized)

  const scale = Math.max(twos, fives)
  if (scale === 0) return format(normalized)

  const scaled = Math.abs(normalized.n) * 10 ** scale / normalized.d
  if (!Number.isSafeInteger(scaled)) return format(normalized)

  const digits = String(scaled).padStart(scale + 1, '0')
  const point = digits.length - scale
  return `${normalized.n < 0 ? '-' : ''}${digits.slice(0, point)}.${digits.slice(point)}`
}

function mixedLabel(value: { n: number; d: number }): string {
  const normalized = rational(value.n, value.d)
  if (normalized.n < 0 || normalized.d === 1 || Math.abs(normalized.n) < normalized.d) {
    return format(normalized)
  }

  const whole = Math.floor(normalized.n / normalized.d)
  const remainder = normalized.n % normalized.d
  return `${whole} ${remainder}/${normalized.d}`
}

/**
 * Turn an answer declaration into text a learner can read.
 *
 * Internal choice ids and compound-entry encodings are submission details, so
 * every answer arm resolves to visible notation here instead of leaking the
 * value held by an input control.
 */
export function answerLabel(answer: Answer, choices: readonly Choice[] = []): string {
  switch (answer.kind) {
    case 'exact': {
      const value = rational(answer.n, answer.d)
      if (answer.requireDecimal) return entryLabel(decimalLabel(value))
      if (answer.requireMixed) return entryLabel(mixedLabel(value))
      return entryLabel(format(value))
    }
    case 'approx':
      return entryLabel(String(answer.value))
    case 'choice': {
      const matches = choices.filter((choice) => choice.id === answer.id)
      if (matches.length !== 1 || !matches[0].label.trim()) {
        throw new Error('choice answer needs exactly one visible label')
      }
      return matches[0].label
    }
    case 'expression':
      return entryLabel(answer.canonical)
    case 'point':
      return coordinateLabel(answer)
    case 'root-pair':
      return answer.roots
        .map((root, index) => `Root ${index + 1}: ${entryLabel(format(rational(root.n, root.d)))}`)
        .join(', ')
    default: {
      const unhandled: never = answer
      throw new Error(`Unhandled answer: ${JSON.stringify(unhandled)}`)
    }
  }
}
