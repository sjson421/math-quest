import type { MathNotation, Operator } from '../../lib/types'
import { applyOperator } from './phrasing'

/** A numeric expression authored as the structure the learner must read. */
export type NumericExpression = number | BinaryExpression | PowerExpression

type BinaryExpression = {
  kind: 'binary'
  left: NumericExpression
  operator: Operator
  right: NumericExpression
}

type PowerExpression = {
  kind: 'power'
  base: NumericExpression
  exponent: number
}

export const op = (
  left: NumericExpression,
  operator: Operator,
  right: NumericExpression,
): NumericExpression => ({ kind: 'binary', left, operator, right })

export const power = (base: NumericExpression, exponent: number): NumericExpression => ({
  kind: 'power',
  base,
  exponent,
})

const PRECEDENCE: Record<Operator, number> = { '+': 1, '−': 1, '×': 2, '÷': 2 }

const isValue = (node: NumericExpression): node is number => typeof node === 'number'
const isBinary = (node: NumericExpression): node is BinaryExpression =>
  !isValue(node) && node.kind === 'binary'

const needsBinaryParentheses = (
  child: NumericExpression,
  parent: BinaryExpression,
  onRight: boolean,
) =>
  isBinary(child) && (
    PRECEDENCE[child.operator] < PRECEDENCE[parent.operator] ||
    (onRight && PRECEDENCE[child.operator] === PRECEDENCE[parent.operator])
  )

/** Inline text, with brackets only where removing them changes the tree's value. */
export function renderExpression(node: NumericExpression): string {
  if (isValue(node)) return String(node)

  if (node.kind === 'power') {
    const base = renderExpression(node.base)
    return `${isValue(node.base) ? base : `(${base})`}^${node.exponent}`
  }

  const side = (child: NumericExpression, onRight: boolean) => {
    const rendered = renderExpression(child)
    return needsBinaryParentheses(child, node, onRight) ? `(${rendered})` : rendered
  }

  return `${side(node.left, false)} ${node.operator} ${side(node.right, true)}`
}

const text = (value: string): MathNotation => ({ kind: 'text', value })

/** The same expression as structured notation, preserving the inline bracket rule. */
export function expressionNotation(node: NumericExpression): MathNotation {
  if (isValue(node)) return text(String(node))

  if (node.kind === 'power') {
    const base = expressionNotation(node.base)
    return {
      kind: 'superscript',
      base: isValue(node.base)
        ? base
        : { kind: 'row', children: [text('('), base, text(')')] },
      exponent: text(String(node.exponent)),
    }
  }

  const side = (child: NumericExpression, onRight: boolean): MathNotation => {
    const rendered = expressionNotation(child)
    return needsBinaryParentheses(child, node, onRight)
      ? { kind: 'row', children: [text('('), rendered, text(')')] }
      : rendered
  }

  return {
    kind: 'row',
    children: [side(node.left, false), text(` ${node.operator} `), side(node.right, true)],
  }
}

/** The exact numeric value under ordinary arithmetic and exponent precedence. */
export function evaluateExpression(node: NumericExpression): number {
  if (isValue(node)) return node
  if (node.kind === 'power') return evaluateExpression(node.base) ** node.exponent
  return applyOperator(evaluateExpression(node.left), evaluateExpression(node.right), node.operator)
}

type FlatExpression = { values: number[]; operators: Operator[] }

/**
 * Throw away binary structure while treating each power as an already-evaluated value.
 * This is the learner view behind Unit 5's written-order misconceptions.
 */
function flattenExpression(node: NumericExpression): FlatExpression {
  if (!isBinary(node)) return { values: [evaluateExpression(node)], operators: [] }

  const left = flattenExpression(node.left)
  const right = flattenExpression(node.right)
  return {
    values: [...left.values, ...right.values],
    operators: [...left.operators, node.operator, ...right.operators],
  }
}

export const foldInOrder = (node: NumericExpression): number => {
  const { values, operators } = flattenExpression(node)
  return operators.reduce(
    (total, operator, index) => applyOperator(total, values[index + 1], operator),
    values[0],
  )
}

/** Binary precedence honoured after authored parentheses have been discarded. */
export const ignoringParentheses = (node: NumericExpression): number => {
  const { values, operators } = flattenExpression(node)
  const terms = [values[0]]
  const additive: Operator[] = []

  operators.forEach((operator, index) => {
    const value = values[index + 1]
    if (PRECEDENCE[operator] === 2) {
      terms[terms.length - 1] = applyOperator(terms[terms.length - 1], value, operator)
    } else {
      additive.push(operator)
      terms.push(value)
    }
  })

  return additive.reduce(
    (total, operator, index) => applyOperator(total, terms[index + 1], operator),
    terms[0],
  )
}
