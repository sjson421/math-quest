import type { DecimalArithmeticData, DecimalValue } from './types'

const power = (scale: number) => 10 ** scale

const assertDecimal = ({ coefficient, scale }: DecimalValue) => {
  if (!Number.isSafeInteger(coefficient) || coefficient < 0) {
    throw new Error('decimal coefficient must be a nonnegative safe integer')
  }
  if (scale !== 1 && scale !== 2) throw new Error('decimal scale must be 1 or 2')
}

/** Format exact source digits while retaining the declared decimal places. */
export function decimalText(value: DecimalValue, targetScale: number = value.scale): string {
  assertDecimal(value)
  if (!Number.isInteger(targetScale) || targetScale < value.scale || targetScale > 2) {
    throw new Error('decimal target scale must retain the source precision through hundredths')
  }

  const denominator = power(value.scale)
  const whole = Math.floor(value.coefficient / denominator)
  const fraction = String(value.coefficient % denominator)
    .padStart(value.scale, '0')
    .padEnd(targetScale, '0')
  return `${whole}.${fraction}`
}

/** Both operands at one visible scale, which is what aligns their points. */
export function decimalColumnText(data: DecimalArithmeticData): readonly [string, string] {
  const scale: 1 | 2 = data.left.scale === 2 || data.right.scale === 2 ? 2 : 1
  return [decimalText(data.left, scale), decimalText(data.right, scale)]
}
